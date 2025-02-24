import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { OrderItem, OrderStatusHistory } from "@/types/order";

interface ExtendedOrderItem extends OrderItem {
  product: {
    sellerId: string;
    title: string;
    images: string[];
  };
}

export default async function SellerOrderDetailsPage({
  params,
}: {
  params: { id: string };
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

  const order = await prisma.order.findUnique({
    where: { id: params.id },
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
      statusHistory: {
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
      },
    },
  });

  if (!order) {
    redirect("/seller/orders");
  }

  // Verify seller owns at least one product in the order
  const hasSellerProducts = order.items.some(
    (item: ExtendedOrderItem) => item.product.sellerId === seller.id
  );

  if (!hasSellerProducts) {
    redirect("/seller/orders");
  }

  // Filter items to only show seller's products
  const sellerItems = order.items.filter(
    (item: ExtendedOrderItem) => item.product.sellerId === seller.id
  );

  const sellerTotal = sellerItems.reduce(
    (sum: number, item: ExtendedOrderItem) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Order #{order.id.slice(-8)}
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/seller/orders"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Details */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Order Details
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Order Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Total Amount (Your Items)
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatCurrency(sellerTotal)}
                  </dd>
                </div>
                {order.trackingNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Tracking Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {order.trackingNumber}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Customer Details
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.user.name || "Guest"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Shipping Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.shippingAddress}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="lg:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Order Items (Your Products)
              </h3>
              <div className="mt-4">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {sellerItems.map((item: ExtendedOrderItem) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <Image
                            src={item.product.images[0] || "/placeholder.jpg"}
                            alt={item.product.title}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.product.title}</h3>
                              <p className="ml-4">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <p className="text-gray-500">
                              Qty {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Order History
              </h3>
              <div className="mt-4 flow-root">
                <ul className="-mb-8">
                  {order.statusHistory.map((history: OrderStatusHistory, idx: number) => (
                    <li key={history.id}>
                      <div className="relative pb-8">
                        {idx !== order.statusHistory.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg
                                className="h-5 w-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <p className="text-sm text-gray-500">
                                Status changed to{" "}
                                <span className="font-medium text-gray-900">
                                  {history.status}
                                </span>{" "}
                                by{" "}
                                <span className="font-medium text-gray-900">
                                  {history.user.name || history.user.email}
                                </span>
                              </p>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  history.createdAt
                                ).toLocaleDateString()}{" "}
                                {new Date(history.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            {history.note && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-700">
                                  {history.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
