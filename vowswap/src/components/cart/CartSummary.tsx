"use client";

import { useCart } from "@/contexts/cart";
import { useRouter } from "next/navigation";

export function CartSummary() {
  const { cart } = useCart();
  const router = useRouter();

  const subtotal: number = cart.total;
  const shipping: number = 0; // Free shipping for now
  const total: number = subtotal + shipping;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-medium mb-4">Order Summary</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        disabled={cart.items.length === 0}
      >
        Proceed to Checkout
      </button>

      {cart.items.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-2">
          Your cart is empty
        </p>
      )}
    </div>
  );
}
