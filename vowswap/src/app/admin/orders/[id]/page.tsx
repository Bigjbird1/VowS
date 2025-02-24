import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderDetails from "@/components/admin/OrderDetails";

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
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
    where: { id: params.id },
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

  // Convert null to undefined for optional fields
  const order = orderData ? {
    ...orderData,
    paymentIntent: orderData.paymentIntent || undefined,
    trackingNumber: orderData.trackingNumber || undefined,
    notes: orderData.notes || undefined,
  } : null;

  if (!order) {
    redirect("/admin/orders");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetails order={order} />
    </div>
  );
}
