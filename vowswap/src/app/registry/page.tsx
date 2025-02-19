import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Registry, RegistryItem } from "@/types/registry";

interface RegistryWithItems extends Registry {
  items: (RegistryItem & {
    product: {
      title: string;
      price: number;
      images: string[];
    } | null;
    contributions: {
      amount: number;
    }[];
  })[];
}

export default async function RegistryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const registries = await prisma.registry.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      eventDate: "asc",
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              title: true,
              price: true,
              images: true,
            },
          },
          contributions: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
  }) as RegistryWithItems[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Registries</h1>
        <Link
          href="/registry/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Registry
        </Link>
      </div>

      {registries.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">
            No registries found
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first registry to start managing your wedding gifts
          </p>
          <Link
            href="/registry/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Create Your First Registry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registries.map((registry: RegistryWithItems) => {
            const totalItems = registry.items.length;
            const purchasedItems = registry.items.filter(
              (item) => item.status === "PURCHASED"
            ).length;
            const totalContributions = registry.items.reduce(
              (sum: number, item) =>
                sum +
                item.contributions.reduce(
                  (itemSum: number, contribution) => itemSum + contribution.amount,
                  0
                ),
              0
            );

            return (
              <Link
                key={registry.id}
                href={`/registry/${registry.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
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
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{registry.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {formatDate(registry.eventDate)}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium">
                        {purchasedItems}/{totalItems}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contributions</p>
                      <p className="font-medium">${totalContributions}</p>
                    </div>
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
