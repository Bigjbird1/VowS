import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AddWishlistItemRequest } from "@/types/registry"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: params.id },
    })

    if (!wishlist) {
      return new NextResponse("Wishlist not found", { status: 404 })
    }

    // Only allow wishlist owner to add items
    if (wishlist.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: AddWishlistItemRequest = await req.json()

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: params.id,
        ...body,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("[WISHLIST_ITEM_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!wishlist) {
      return new NextResponse("Wishlist not found", { status: 404 })
    }

    // Check privacy settings for non-owners
    if (
      wishlist.privacyStatus === "PRIVATE" &&
      wishlist.userId !== session?.user?.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(wishlist.items)
  } catch (error) {
    console.error("[WISHLIST_ITEMS_LIST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
