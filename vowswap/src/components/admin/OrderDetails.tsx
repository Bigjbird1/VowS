"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface OrderDetailsProps {
  order: Order;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const updateOrderStatus = async (status: OrderStatus) => {
    try {
      setIsLoading(true);
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Order Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Order #{order.id}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
            order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {order.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Placed on {formatDateTime(order.createdAt)}
        </p>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image
                  src={item.product.images[0] || '/placeholder.jpg'}
                  alt={item.product.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">
                  {item.product.title}
                </h4>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-800">
                {formatCurrency(item.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Summary</h3>
        <div className="space-y-2">
          <div className="pt-2 mt-2 flex justify-between">
            <span className="font-medium text-gray-800">Total Amount</span>
            <span className="font-medium text-gray-800">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
        <div className="flex gap-3">
          {order.status === 'PENDING' && (
            <button
              onClick={() => updateOrderStatus('PROCESSING')}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Start Processing
            </button>
          )}
          {order.status === 'PROCESSING' && (
            <button
              onClick={() => updateOrderStatus('SHIPPED')}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Shipped
            </button>
          )}
          {order.status === 'SHIPPED' && (
            <button
              onClick={() => updateOrderStatus('DELIVERED')}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Delivered
            </button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <button
              onClick={() => updateOrderStatus('CANCELLED')}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
