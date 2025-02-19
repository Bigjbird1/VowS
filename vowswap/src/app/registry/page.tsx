import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Registry } from "@/types/registry"

interface RegistryWithCount extends Registry {
  _count: {
    items: number
  }
}

export const metadata: Metadata = {
  title: "My Registries | VowSwap",
  description: "Manage your wedding registries on VowSwap",
}

export default async function RegistryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/registry")
  }

  const registries = await prisma.registry.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        include: {
          contributions: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
    orderBy: {
      eventDate: "asc",
    },
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Registries</h1>
        <Link
          href="/registry/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Registry
        </Link>
      </div>

      {registries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any registries yet.</p>
          <Link
            href="/registry/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first registry
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {registries.map((registry: RegistryWithCount) => {
            const totalItems = registry._count.items;
            const purchasedItems = registry.items.filter(
              (item) => item.status === "PURCHASED"
            ).length;
            const totalContributions = registry.items.reduce(
              (sum, item) =>
                sum +
                item.contributions.reduce(
                  (itemSum, contribution) => itemSum + contribution.amount,
                  0
                ),
              0
            );

            return (
              <Link
                key={registry.id}
                href={`/registry/${registry.id}`}
                className="block bg-white shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 rounded-t-lg overflow-hidden">
                  {registry.coverImage ? (
                    <img
                      src={registry.coverImage}
                      alt={registry.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No cover image</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-white/90 rounded text-sm">
                    {registry.privacyStatus.toLowerCase()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {registry.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <p>{registry.coupleName1}{registry.coupleName2 ? ` & ${registry.coupleName2}` : ''}</p>
                    <p>{formatDate(registry.eventDate)}</p>
                    <p>{registry.eventLocation}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium">
                        {purchasedItems}/{totalItems}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contributions</p>
                      <p className="font-medium">${totalContributions.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        registry.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : registry.status === "ARCHIVED"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {registry.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
