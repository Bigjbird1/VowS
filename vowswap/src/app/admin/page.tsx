import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
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

  // Get dashboard stats
  const [
    totalOrders,
    totalRevenue,
    recentOrders,
    popularProducts,
    recentActions,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
    }),
    prisma.order.findMany({
      take: 5,
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
        items: {
          include: {
            product: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _count: {
        _all: true,
      },
      _sum: {
        price: true,
      },
      orderBy: {
        _count: {
          _all: "desc",
        },
      },
      take: 5,
    }).then(async (items) => {
      const productIds = items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          title: true,
        },
      });

      return items.map((item) => ({
        productId: item.productId,
        title: products.find((p) => p.id === item.productId)?.title || "",
        totalOrders: item._count._all,
        revenue: item._sum.price || 0,
      }));
    }),
    prisma.adminAction.findMany({
      take: 10,
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
    }),
  ]);

  return (
    <AdminDashboard
      stats={{
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        recentOrders,
        popularProducts,
        recentActions,
      }}
    />
  );
}
