import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CustomerOrderDetailsProps {
  order: Order;
}

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function CustomerOrderDetails({ order }: CustomerOrderDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const canCancel = order.status === "PENDING";

  const handleCancelOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
    }
  };

  const downloadInvoice = () => {
    // Create invoice content
    const invoiceContent = `
VowSwap - Order Invoice

Order ID: ${order.id}
Date: ${formatDateTime(order.createdAt)}

Items:
${order.items
  .map(
    (item) =>
      `${item.product.title}
Quantity: ${item.quantity}
Price: ${formatCurrency(item.price)}
Subtotal: ${formatCurrency(item.price * item.quantity)}
`
  )
  .join("\n")}

Total: ${formatCurrency(order.total)}

Shipping Address:
${order.shippingAddress}
    `.trim();

    // Create blob and download
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vowswap-order-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
          <p className="text-gray-600">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={downloadInvoice}
            className="text-blue-600 hover:text-blue-800"
          >
            Download Invoice
          </button>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-red-600 hover:text-red-800"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Order Status Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2" />
          <div
            className="absolute left-0 top-1/2 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-500"
            style={{
              width: `${
                (currentStatusIndex / (STATUS_ORDER.length - 1)) * 100
              }%`,
            }}
          />
          <div className="relative flex justify-between">
            {STATUS_ORDER.map((status, index) => (
              <div
                key={status}
                className={`flex flex-col items-center ${
                  index <= currentStatusIndex
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStatusIndex
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 text-sm font-medium">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Order Items</h2>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="p-6 flex items-center">
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium hover:text-blue-600"
                >
                  {item.product.title}
                </Link>
                <p className="text-gray-600">
                  Quantity: {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        <p className="whitespace-pre-line">{order.shippingAddress}</p>
        {order.trackingNumber && (
          <div className="mt-4">
            <p className="font-medium">Tracking Number:</p>
            <p>{order.trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
            <p className="mb-6">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
