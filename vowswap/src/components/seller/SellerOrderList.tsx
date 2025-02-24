"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types/order";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    images: string[];
  };
}

interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  shippingAddress: string;
  trackingNumber?: string;
  items: OrderItem[];
  user: {
    name?: string;
    email?: string;
  };
}

interface SellerOrderListProps {
  orders: Order[];
}

export default function SellerOrderList({ orders }: SellerOrderListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    try {
      const response = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleTrackingUpdate = async (orderId: string) => {
    if (!trackingNumber.trim()) return;

    setIsUpdating(orderId);
    try {
      const response = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tracking number");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating tracking:", error);
      alert("Failed to update tracking number");
    } finally {
      setIsUpdating(null);
      setTrackingNumber("");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Details
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Order #{order.id.slice(-8)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  {order.items.length} items
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.user.name || "Guest"}
                </div>
                <div className="text-sm text-gray-500">{order.user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                {order.trackingNumber && (
                  <div className="text-sm text-gray-500 mt-1">
                    Tracking: {order.trackingNumber}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(order.total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="space-y-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "PROCESSING")}
                      disabled={isUpdating === order.id}
                      className="text-blue-600 hover:text-blue-900 block disabled:opacity-50"
                    >
                      Process Order
                    </button>
                  )}
                  {order.status === "PROCESSING" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter tracking number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleTrackingUpdate(order.id)}
                        disabled={isUpdating === order.id || !trackingNumber}
                        className="text-blue-600 hover:text-blue-900 block disabled:opacity-50"
                      >
                        Add Tracking
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
                        disabled={isUpdating === order.id}
                        className="text-purple-600 hover:text-purple-900 block disabled:opacity-50"
                      >
                        Mark as Shipped
                      </button>
                    </div>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "DELIVERED")}
                      disabled={isUpdating === order.id}
                      className="text-green-600 hover:text-green-900 block disabled:opacity-50"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {(order.status === "PENDING" || order.status === "PROCESSING") && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                      disabled={isUpdating === order.id}
                      className="text-red-600 hover:text-red-900 block disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link
                    href={`/seller/orders/${order.id}`}
                    className="text-gray-600 hover:text-gray-900 block"
                  >
                    View Details
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No orders yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Orders from customers will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
