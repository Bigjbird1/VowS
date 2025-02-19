import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateWishlistItemRequest } from "@/types/registry"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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

    // Only allow wishlist owner to update items
    if (wishlist.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: UpdateWishlistItemRequest = await req.json()

    const item = await prisma.wishlistItem.update({
      where: { id: params.itemId },
      data: body,
      include: {
        product: true,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("[WISHLIST_ITEM_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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

    // Only allow wishlist owner to delete items
    if (wishlist.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.wishlistItem.delete({
      where: { id: params.itemId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[WISHLIST_ITEM_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// Move item to registry
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: params.id },
      include: {
        items: {
          where: { id: params.itemId },
          include: { product: true },
        },
      },
    })

    if (!wishlist || !wishlist.items[0]) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Only allow wishlist owner to move items
    if (wishlist.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { registryId } = await req.json()

    // Verify registry exists and user owns it
    const registry = await prisma.registry.findFirst({
      where: {
        id: registryId,
        userId: session.user.id,
      },
    })

    if (!registry) {
      return new NextResponse("Registry not found", { status: 404 })
    }

    // Create registry item
    const registryItem = await prisma.registryItem.create({
      data: {
        registryId,
        productId: wishlist.items[0].productId,
        quantity: 1,
        priority: wishlist.items[0].priority,
        note: wishlist.items[0].note,
      },
      include: {
        product: true,
      },
    })

    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id: params.itemId },
    })

    return NextResponse.json(registryItem)
  } catch (error) {
    console.error("[WISHLIST_ITEM_MOVE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
