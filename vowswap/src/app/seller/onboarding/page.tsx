import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerOnboardingForm from "@/components/seller/SellerOnboardingForm";

export default async function SellerOnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/seller/onboarding");
  }

  // Check if user is already a seller
  const existingSeller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });

  if (existingSeller) {
    redirect("/seller");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Become a Seller on VowSwap
            </h1>
            <p className="mt-2 text-gray-600">
              Set up your seller profile to start listing wedding items
            </p>
          </div>
          <SellerOnboardingForm userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
