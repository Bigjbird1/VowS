import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface OrderDetailsProps {
  order: Order & {
    statusHistory: Array<{
      id: string;
      status: OrderStatus;
      note?: string;
      createdAt: Date;
      user: {
        name?: string;
        email?: string;
      };
    }>;
  };
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [note, setNote] = useState("");

  const handleUpdateOrder = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          note: note || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
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
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            order.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "PROCESSING"
              ? "bg-blue-100 text-blue-800"
              : order.status === "SHIPPED"
              ? "bg-purple-100 text-purple-800"
              : order.status === "DELIVERED"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {order.user.name || "N/A"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {order.user.email}
            </p>
            <p>
              <span className="font-medium">Shipping Address:</span>
              <br />
              {order.shippingAddress}
            </p>
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
                <h3 className="font-medium">{item.product.title}</h3>
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

      {/* Update Order Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Update Order</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this update"
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleUpdateOrder}
            disabled={isUpdating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Order"}
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <div className="space-y-4">
          {order.statusHistory.map((history) => (
            <div
              key={history.id}
              className="flex items-start border-l-2 border-gray-200 pl-4"
            >
              <div className="flex-1">
                <p className="font-medium">{history.status}</p>
                {history.note && (
                  <p className="text-gray-600 mt-1">{history.note}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(history.createdAt)} by{" "}
                  {history.user.name || history.user.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
