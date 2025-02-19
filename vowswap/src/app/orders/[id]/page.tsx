import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerOrderDetails from "@/components/orders/CustomerOrderDetails";

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
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
        orderBy: {
          createdAt: "desc",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomerOrderDetails order={order} />
    </div>
  );
}
