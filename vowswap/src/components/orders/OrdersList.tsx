"use client";

import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import OrderStatusBadge from "./OrderStatusBadge";
import { useRouter, useSearchParams } from "next/navigation";

interface OrdersListProps {
  orders: Order[];
  pagination: {
    total: number;
    pages: number;
    current: number;
  };
}

export default function OrdersList({ orders, pagination }: OrdersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/orders?${params.toString()}`);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          No orders found
        </h2>
        <p className="text-gray-500 mb-6">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Orders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        Order #{order.id}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-sm leading-5 font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="sm:flex sm:justify-between">
                      <div className="flex items-center gap-4">
                        {/* Show first item image and count */}
                        {order.items[0] && (
                          <>
                            <div className="relative w-16 h-16">
                              <Image
                                src={order.items[0].product.images[0]}
                                alt={order.items[0].product.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">
                                {order.items[0].product.title}
                              </p>
                              {order.items.length > 1 && (
                                <p className="text-sm text-gray-500">
                                  +{order.items.length - 1} more items
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <p className="text-sm text-gray-500">
                          Ordered on {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  pagination.current === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
