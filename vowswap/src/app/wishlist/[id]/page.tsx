import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WishlistItemWithProduct } from "@/types/wishlist"
import { notFound } from "next/navigation"
import WishlistDetails from "@/components/wishlist/WishlistDetails"
import WishlistActions from "@/components/wishlist/WishlistActions"

export const metadata: Metadata = {
  title: "Manage Wishlist | VowSwap",
  description: "Manage your wishlist on VowSwap",
}

interface WishlistPageProps {
  params: {
    id: string
  }
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/wishlist/" + params.id)
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!wishlist) {
    notFound()
  }

  const isOwner = wishlist.userId === session.user.id

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wishlist Details</h1>
        {isOwner && (
          <WishlistActions
            wishlistId={wishlist.id}
            isOwner={isOwner}
          />
        )}
      </div>

      <WishlistDetails wishlist={wishlist} />

      {wishlist.items.map((item: WishlistItemWithProduct) => (
        <div key={item.id} className="mt-4 flex justify-end">
          {isOwner && (
            <WishlistActions
              wishlistId={wishlist.id}
              itemId={item.id}
              isOwner={isOwner}
            />
          )}
        </div>
      ))}
    </div>
  )
}
