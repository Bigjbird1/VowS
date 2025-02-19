import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/types/order";
import { PrismaClient } from "@prisma/client";

interface OrderItem {
  product: {
    sellerId: string;
  };
}

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    // Get the order and verify it contains seller's products
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Verify seller owns at least one product in the order
    const hasSellerProducts = order.items.some(
      (item: OrderItem) => item.product.sellerId === seller.id
    );

    if (!hasSellerProducts) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const updateData: { status?: OrderStatus; trackingNumber?: string } = {};

    // Validate and set status update
    if (body.status) {
      const newStatus = body.status as OrderStatus;
      const currentStatus = order.status;

      // Validate status transition
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (!validTransitions[currentStatus as OrderStatus]?.includes(newStatus)) {
        return new NextResponse(
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
          { status: 400 }
        );
      }

      updateData.status = newStatus;
    }

    // Validate and set tracking number
    if (body.trackingNumber) {
      if (order.status !== "PROCESSING") {
        return new NextResponse(
          "Tracking number can only be added to processing orders",
          { status: 400 }
        );
      }
      updateData.trackingNumber = body.trackingNumber;
    }

    // Update the order
    const updatedOrder = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Update order
      const updated = await tx.order.update({
        where: { id: params.id },
        data: updateData,
      });

      // Create status history entry if status changed
      if (updateData.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            status: updateData.status,
            updatedBy: session.user.id,
            note: body.note,
          },
        });
      }

      return updated;
    });

    // Create notification for status change
    if (updateData.status) {
      await prisma.sellerNotification.create({
        data: {
          sellerId: seller.id,
          type: "ORDER_CANCELLED",
          message: `Order #${order.id.slice(-8)} status updated to ${updateData.status}`,
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_UPDATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    // Get the order with all details
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Verify seller owns at least one product in the order
    const hasSellerProducts = order.items.some(
      (item: OrderItem) => item.product.sellerId === seller.id
    );

    if (!hasSellerProducts) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
