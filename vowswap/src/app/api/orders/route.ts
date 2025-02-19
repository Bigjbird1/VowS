import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { OrderStatus } from "@/types/order";
import { Resend } from "resend";
import type { PrismaClient } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderInput {
  items: OrderItem[];
  shippingAddress: string;
  total: number;
  paymentIntent: string;
}

type OrderItemWithProduct = Awaited<ReturnType<typeof prisma.orderItem.create>> & {
  product: Awaited<ReturnType<typeof prisma.product.findUnique>>;
};

type OrderWithItems = Awaited<ReturnType<typeof prisma.order.create>> & {
  items: OrderItemWithProduct[];
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json() as OrderInput;
    const { items, shippingAddress, total, paymentIntent } = data;

    // Start transaction to ensure all operations succeed or fail together
    const order = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          status: "PENDING",
          shippingAddress,
          paymentIntent,
          paymentStatus: "paid",
          items: {
            create: items.map((item: OrderItem) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          statusHistory: {
            create: {
              status: "PENDING",
              updatedBy: session.user.id,
              note: "Order created",
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update inventory for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return order as OrderWithItems;
    });

    // Send order confirmation email
    if (session.user.email) {
      try {
        await resend.emails.send({
          from: "VowSwap <orders@vowswap.com>",
          to: session.user.email,
          subject: `Order Confirmation - #${order.id}`,
          html: `
            <h1>Thank you for your order!</h1>
            <p>Order ID: ${order.id}</p>
            <p>Total: $${order.total.toFixed(2)}</p>
            <p>Status: ${order.status}</p>
            <h2>Items:</h2>
            <ul>
              ${order.items.map((item: OrderItemWithProduct) => `
                <li>${item.product.title} - Quantity: ${item.quantity}</li>
              `).join("")}
            </ul>
            <p>Shipping to:</p>
            <p>${order.shippingAddress}</p>
          `,
        });

        // Update emailsSent array
        await prisma.order.update({
          where: { id: order.id },
          data: {
            emailsSent: {
              push: "order_confirmation",
            },
          },
        });
      } catch (error) {
        console.error("Failed to send order confirmation email:", error);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const where = user?.role === "admin" 
      ? status ? { status } : {}
      : { userId: session.user.id, ...(status ? { status } : {}) };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
