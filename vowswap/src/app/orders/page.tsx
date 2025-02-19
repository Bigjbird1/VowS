import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersList from "@/components/orders/OrdersList";

interface OrdersPageProps {
  searchParams: {
    page?: string;
    limit?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
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
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <OrdersList
        orders={orders}
        pagination={{
          total,
          pages: Math.ceil(total / limit),
          current: page,
        }}
      />
    </div>
  );
}
