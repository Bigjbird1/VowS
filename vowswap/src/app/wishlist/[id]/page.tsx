import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WishlistItemWithProduct, Wishlist } from "@/types/wishlist"
import { notFound } from "next/navigation"
import WishlistDetails from "@/components/wishlist/WishlistDetails"
import WishlistActions from "@/components/wishlist/WishlistActions"
import { ItemPriority } from "@/types/registry"

export const metadata: Metadata = {
  title: "Manage Wishlist | VowSwap",
  description: "Manage your wishlist on VowSwap",
}

interface WishlistPageProps {
  params: Promise<{
    id: string
  }>
}

interface WishlistViewData {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  items: WishlistItemWithProduct[]
  user: {
    name: string | null
    email: string | null
  }
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/wishlist/" + resolvedParams.id)
  }

  const wishlistData = await prisma.wishlist.findUnique({
    where: { id: resolvedParams.id },
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
          name: true,
          email: true,
        },
      },
    },
  })

  if (!wishlistData) {
    notFound()
  }

  // Create a base wishlist object that matches the Wishlist type
  const baseWishlist: Wishlist = {
    id: wishlistData.id,
    userId: wishlistData.userId,
    title: wishlistData.title,
    description: wishlistData.description,
    isPublic: wishlistData.isPublic,
    createdAt: wishlistData.createdAt,
    updatedAt: wishlistData.updatedAt,
    items: [],
    user: {
      id: session.user.id,
      name: wishlistData.user.name,
      email: wishlistData.user.email,
      emailVerified: null,
      hashedPassword: null,
      image: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      addresses: [],
      orders: [],
    },
  }

  // Transform the data to match the expected types
  const wishlist: WishlistViewData = {
    id: wishlistData.id,
    title: wishlistData.title,
    description: wishlistData.description,
    isPublic: wishlistData.isPublic,
    items: wishlistData.items.map((item) => ({
      id: item.id,
      wishlistId: item.wishlistId,
      productId: item.productId,
      priority: item.priority as ItemPriority,
      note: item.note,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: item.product,
      wishlist: baseWishlist,
    })),
    user: {
      name: wishlistData.user.name,
      email: wishlistData.user.email,
    },
  }

  const isOwner = wishlistData.userId === session.user.id

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

      {wishlist.items.map((item) => (
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
