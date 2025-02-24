import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { OrderStatus, OrderUpdateInput } from "@/types/order";
import { Resend } from "resend";
import type { PrismaClient, Prisma } from "@prisma/client";
import type { UserRole } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderWithUser = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: {
        email: true;
      };
    };
  };
}>;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
    statusHistory: true;
    user: {
      select: {
        email: true;
      };
    };
  };
}>;

const STATUS_EMAIL_TEMPLATES: Record<OrderStatus, { subject: string; body: string }> = {
  PROCESSING: {
    subject: "Your order is being processed",
    body: "We're preparing your order for shipment.",
  },
  SHIPPED: {
    subject: "Your order has been shipped",
    body: "Your order is on its way!",
  },
  DELIVERED: {
    subject: "Your order has been delivered",
    body: "Your order has been delivered. We hope you enjoy your items!",
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    body: "Your order has been cancelled. If you have any questions, please contact us.",
  },
  PENDING: {
    subject: "Order received",
    body: "We've received your order and will process it soon.",
  },
};

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or the order owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
              },
            },
          },
        },
        statusHistory: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow admin or order owner to view the order
    if (user?.role !== ("admin" as UserRole) && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== ("admin" as UserRole)) {
      return NextResponse.json(
        { error: "Only admins can update orders" },
        { status: 401 }
      );
    }

    const data = await request.json() as OrderUpdateInput;
    const { status, trackingNumber, notes } = data;

    const order = await prisma.$transaction<OrderWithUser>(async (prisma: TransactionClient) => {
      // Get the order with user info for email notification
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Update the order
      const updatedOrder = await prisma.order.update({
        where: { id: params.id },
        data: {
          ...(status && { status }),
          ...(trackingNumber && { trackingNumber }),
          ...(notes && { notes }),
          statusHistory: {
            create: {
              status: status || order.status,
              updatedBy: session.user.id,
              note: notes || `Status updated to ${status}`,
            },
          },
        },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      });

      // Log admin action
      await prisma.adminAction.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_ORDER",
          details: JSON.stringify({
            orderId: params.id,
            changes: data,
          }),
        },
      });

      return updatedOrder;
    });

    // Send email notification if status changed
    if (status && order.user.email) {
      const template = STATUS_EMAIL_TEMPLATES[status];
      try {
        await resend.emails.send({
          from: "VowSwap <orders@vowswap.com>",
          to: order.user.email,
          subject: template.subject,
          html: `
            <h1>${template.subject}</h1>
            <p>${template.body}</p>
            <p>Order ID: ${order.id}</p>
            ${status === "SHIPPED" && trackingNumber ? `
              <p>Tracking Number: ${trackingNumber}</p>
            ` : ""}
            <p>You can view your order details <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">here</a>.</p>
          `,
        });

        // Update emailsSent array
        await prisma.order.update({
          where: { id: params.id },
          data: {
            emailsSent: {
              push: `status_${status.toLowerCase()}`,
            },
          },
        });
      } catch (error) {
        console.error("Failed to send status update email:", error);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation if order is PENDING and user is the owner
    if (
      order.status !== "PENDING" ||
      order.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Cannot cancel this order" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.$transaction<OrderWithUser>(async (prisma: TransactionClient) => {
      // Update order status to CANCELLED
      const updatedOrder = await prisma.order.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          statusHistory: {
            create: {
              status: "CANCELLED",
              updatedBy: session.user.id,
              note: "Order cancelled by customer",
            },
          },
        },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      });

      // Restore inventory
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: params.id },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
