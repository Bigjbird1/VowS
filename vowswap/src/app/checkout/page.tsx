"use client";

import { useCart } from "@/contexts/cart";
import { CartSummary } from "@/components/cart/CartSummary";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { ReviewOrder } from "@/components/checkout/ReviewOrder";

type CheckoutStep = "shipping" | "payment" | "review";

import { ShippingFormData } from "@/components/checkout/ShippingForm";
import { PaymentFormData } from "@/components/checkout/PaymentForm";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const { status } = useSession();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin?redirect=/checkout");
    return null;
  }

  // Redirect to cart if empty
  if (cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const steps = [
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ];

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setCurrentStep("review");
  };

  const handleReviewSubmit = async () => {
    // TODO: Implement order submission
    console.log("Order submitted", { shippingData, paymentData, cart });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex justify-center items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 ${
                  currentStep === step.id ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-12 h-1 mx-4 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Forms */}
        <div className="lg:col-span-2">
          {currentStep === "shipping" && (
            <ShippingForm onSubmit={handleShippingSubmit} />
          )}
          {currentStep === "payment" && (
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              onBack={() => setCurrentStep("shipping")}
            />
          )}
          {currentStep === "review" && (
            <ReviewOrder
              shippingData={shippingData}
              paymentData={paymentData}
              onSubmit={handleReviewSubmit}
              onBack={() => setCurrentStep("payment")}
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </main>
  );
}
