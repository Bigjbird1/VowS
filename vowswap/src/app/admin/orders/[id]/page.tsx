import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderDetails from "@/components/admin/OrderDetails";
import type { Order } from "@/types/order";

export const metadata: Metadata = {
  title: "Order Details | VowSwap Admin",
  description: "Manage order details on VowSwap",
};

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const orderData = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              title: true,
              images: true,
              price: true,
            },
          },
        },
      },
      statusHistory: {
        include: {
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
    },
  });

  if (!orderData) {
    redirect("/admin/orders");
  }

  // Use the Order type from our types file
  const order: Order = {
    ...orderData,
    paymentIntent: orderData.paymentIntent ?? undefined,
    trackingNumber: orderData.trackingNumber ?? undefined,
    notes: orderData.notes ?? undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetails order={order} />
    </div>
  );
}
