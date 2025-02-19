import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/OrdersTable";
import { OrderStatus } from "@/types/order";

interface OrdersPageProps {
  searchParams: {
    status?: OrderStatus;
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    redirect("/");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  const status = searchParams.status as OrderStatus | undefined;
  const search = searchParams.search;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { id: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
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
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  // Get order status counts for filters
  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const filters = {
    status: Object.fromEntries(
      statusCounts.map((item) => [
        item.status,
        item._count,
      ])
    ),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      <OrdersTable
        orders={orders}
        pagination={{
          total,
          pages: Math.ceil(total / limit),
          current: page,
        }}
        filters={filters}
        currentStatus={status}
      />
    </div>
  );
}
