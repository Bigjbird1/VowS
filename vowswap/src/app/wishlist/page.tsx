import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Wishlist } from "@/types/wishlist"

interface WishlistWithCount extends Wishlist {
  _count: {
    items: number
  }
}

export const metadata: Metadata = {
  title: "My Wishlists | VowSwap",
  description: "Manage your wishlists on VowSwap",
}

export default async function WishlistsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/wishlist")
  }

  const wishlists = await prisma.wishlist.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wishlists</h1>
        <Link
          href="/wishlist/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Wishlist
        </Link>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any wishlists yet.</p>
          <Link
            href="/wishlist/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first wishlist
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((wishlist: WishlistWithCount) => (
            <Link
              key={wishlist.id}
              href={`/wishlist/${wishlist.id}`}
              className="block bg-white shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {wishlist.title}
                </h3>
                {wishlist.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {wishlist.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{wishlist._count.items} items</span>
                  <span>{formatDate(wishlist.updatedAt)}</span>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      wishlist.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {wishlist.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
