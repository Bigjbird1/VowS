"use client";

import { useCart } from "@/contexts/cart";
import { CartItem } from "@/components/cart/CartItem";
import { ShippingFormData } from "./ShippingForm";
import { PaymentFormData } from "./PaymentForm";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReviewOrderProps {
  shippingData: ShippingFormData;
  paymentData: PaymentFormData;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewOrder({
  shippingData,
  paymentData,
  onSubmit,
  onBack,
}: ReviewOrderProps) {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items,
          total: cart.total,
          shippingAddress: shippingData,
          paymentIntent: "dummy", // TODO: Replace with actual payment intent from payment provider
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const order = await response.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred placing your order"
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Shipping Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-medium">{shippingData.fullName}</p>
          <p>{shippingData.address}</p>
          <p>
            {shippingData.city}, {shippingData.state} {shippingData.postalCode}
          </p>
          <p>{shippingData.country}</p>
          <p className="mt-2">
            <span className="text-gray-600">Email: </span>
            {shippingData.email}
          </p>
          <p>
            <span className="text-gray-600">Phone: </span>
            {shippingData.phone}
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-medium">{paymentData.cardHolder}</p>
          <p>
            Card ending in {paymentData.cardNumber.slice(-4)}
            <span className="mx-2">•</span>
            Expires {paymentData.expiryDate}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Order Items</h3>
        <div className="divide-y">
          {cart.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.product.title}</h4>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Payment
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
