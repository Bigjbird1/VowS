"use client";

import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface CustomerOrderDetailsProps {
  order: Order;
}

export default function CustomerOrderDetails({ order }: CustomerOrderDetailsProps) {
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

      {/* Shipping Information */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Shipping Information</h3>
        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
        {order.trackingNumber && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-800">Tracking Number:</p>
            <p className="text-sm text-gray-600">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Order Status History */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Order Status History</h3>
        <div className="space-y-3">
          {order.statusHistory.map((history) => (
            <div key={history.id} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium text-gray-800">{history.status}</span>
                {history.note && (
                  <p className="text-gray-500 mt-1">{history.note}</p>
                )}
              </div>
              <span className="text-gray-500">
                {formatDateTime(history.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
