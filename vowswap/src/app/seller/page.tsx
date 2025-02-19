import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SellerDashboard from "@/components/seller/SellerDashboard";

export default async function SellerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/seller");
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    include: {
      products: true,
      settings: true,
      analytics: {
        orderBy: {
          date: "desc",
        },
        take: 30, // Last 30 days
      },
      notifications: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Last 10 notifications
      },
    },
  });

  if (!seller) {
    redirect("/seller/onboarding");
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <SellerDashboard seller={seller} />
      </div>
    </div>
  );
}
