import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerOrderList from "@/components/seller/SellerOrderList";
import { OrderStatus } from "@/types/order";

interface OrderStatusTab {
  status: OrderStatus | "ALL";
  label: string;
  count: number;
}

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: { status?: OrderStatus };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/seller/orders");
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    redirect("/seller/onboarding");
  }

  // Get all orders for seller's products
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            sellerId: seller.id,
          },
        },
      },
      ...(searchParams.status ? { status: searchParams.status } : {}),
    },
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get order counts by status
  const orderCounts = await prisma.order.groupBy({
    by: ["status"],
    where: {
      items: {
        some: {
          product: {
            sellerId: seller.id,
          },
        },
      },
    },
    _count: true,
  });

  const statusTabs: OrderStatusTab[] = [
    { status: "ALL", label: "All Orders", count: orders.length },
    { status: "PENDING", label: "Pending", count: 0 },
    { status: "PROCESSING", label: "Processing", count: 0 },
    { status: "SHIPPED", label: "Shipped", count: 0 },
    { status: "DELIVERED", label: "Delivered", count: 0 },
    { status: "CANCELLED", label: "Cancelled", count: 0 },
  ];

  // Update counts from database
  orderCounts.forEach((count: { status: OrderStatus; _count: number }) => {
    const tab = statusTabs.find((tab) => tab.status === count.status);
    if (tab) {
      tab.count = count._count;
    }
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Orders
            </h2>
          </div>
        </div>

        <div className="mt-4">
          <div className="sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              defaultValue={searchParams.status || "ALL"}
              onChange={(e) => {
                const status = e.target.value;
                window.location.href = status === "ALL" 
                  ? "/seller/orders"
                  : `/seller/orders?status=${status}`;
              }}
            >
              {statusTabs.map((tab) => (
                <option key={tab.status} value={tab.status}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              {statusTabs.map((tab) => {
                const isCurrentTab = 
                  (tab.status === "ALL" && !searchParams.status) ||
                  tab.status === searchParams.status;
                
                return (
                  <a
                    key={tab.status}
                    href={tab.status === "ALL" ? "/seller/orders" : `/seller/orders?status=${tab.status}`}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md
                      ${isCurrentTab
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"}
                    `}
                    aria-current={isCurrentTab ? "page" : undefined}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${isCurrentTab
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-100 text-gray-900"}
                      `}
                    >
                      {tab.count}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mt-6">
          <SellerOrderList orders={orders} sellerId={seller.id} />
        </div>
      </div>
    </div>
  );
}
