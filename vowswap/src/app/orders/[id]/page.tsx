import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerOrderDetails from "@/components/orders/CustomerOrderDetails";
import { Order, OrderStatus, OrderItem, OrderStatusHistory } from "@/types/order";

interface OrderPageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      total: true,
      status: true,
      shippingAddress: true,
      paymentIntent: true,
      paymentStatus: true,
      trackingNumber: true,
      notes: true,
      emailsSent: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          orderId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              title: true,
              images: true,
            },
          },
        },
      },
      statusHistory: {
        select: {
          id: true,
          orderId: true,
          status: true,
          note: true,
          createdAt: true,
          updatedBy: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/orders");
  }

  // Only allow order owner to view the order
  if (order.userId !== session.user.id) {
    redirect("/orders");
  }

  // Convert null values to undefined and ensure all required fields are present
  const processedOrder: Order = {
    id: order.id,
    userId: order.userId,
    total: order.total,
    status: order.status,
    shippingAddress: order.shippingAddress,
    paymentStatus: order.paymentStatus,
    emailsSent: order.emailsSent || [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      orderId: item.orderId,
      quantity: item.quantity,
      price: item.price,
      product: {
        title: item.product.title,
        images: item.product.images || []
      }
    } satisfies OrderItem)),
    statusHistory: order.statusHistory.map(history => ({
      id: history.id,
      orderId: history.orderId,
      status: history.status as OrderStatus,
      note: history.note || null,
      createdAt: history.createdAt,
      updatedBy: history.updatedBy,
      user: {
        name: history.user.name,
        email: history.user.email
      }
    } satisfies OrderStatusHistory)),
    user: {
      name: order.user.name,
      email: order.user.email
    },
    // Optional fields
    paymentIntent: order.paymentIntent || undefined,
    trackingNumber: order.trackingNumber || undefined,
    notes: order.notes || undefined
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomerOrderDetails order={processedOrder} />
    </div>
  );
}
