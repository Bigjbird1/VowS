import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/seller");
  }

  // Check if user is a seller
  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    redirect("/seller/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white border-r border-gray-200 px-4 py-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Seller Dashboard</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/seller"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/seller/products"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/seller/orders"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/seller/analytics"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link
                href="/seller/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
