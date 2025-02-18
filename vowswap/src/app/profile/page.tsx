import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Address, Order } from "@/types/db";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* User Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Address
            </button>
          </div>
          {user.addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No addresses added yet.</p>
          ) : (
            <div className="space-y-4">
              {user.addresses.map((address: Address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 relative hover:border-indigo-500"
                >
                  {address.isDefault && (
                    <span className="absolute top-2 right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Default
                    </span>
                  )}
                  <p className="font-medium">{address.street}</p>
                  <p className="text-sm text-gray-500">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-500">{address.country}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order History
          </h2>
          {user.orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {user.orders.map((order: Order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:border-indigo-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
