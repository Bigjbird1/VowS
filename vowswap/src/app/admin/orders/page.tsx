import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/OrdersTable";
import { Order, OrderStatus } from "@/types/order";

interface OrdersPageProps {
  searchParams: Promise<{
    status?: OrderStatus;
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = parseInt(resolvedSearchParams.limit || "10");
  const status = resolvedSearchParams.status as OrderStatus | undefined;
  const search = resolvedSearchParams.search;

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

  const [ordersData, total] = await Promise.all([
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

  // Convert null to undefined for optional fields
  const orders: Order[] = ordersData.map(order => ({
    ...order,
    paymentIntent: order.paymentIntent ?? undefined,
    trackingNumber: order.trackingNumber ?? undefined,
    notes: order.notes ?? undefined,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      <OrdersTable orders={orders} total={total} />
    </div>
  );
}
