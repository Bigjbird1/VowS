import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateWishlistRequest } from "@/types/registry"

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
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!wishlist) {
      return new NextResponse("Wishlist not found", { status: 404 })
    }

    // Check privacy settings
    if (
      wishlist.privacyStatus === "PRIVATE" &&
      wishlist.userId !== session?.user?.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("[WISHLIST_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
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

    // Only allow wishlist owner to update
    if (wishlist.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: UpdateWishlistRequest = await req.json()

    const updatedWishlist = await prisma.wishlist.update({
      where: { id: params.id },
      data: body,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(updatedWishlist)
  } catch (error) {
    console.error("[WISHLIST_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
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

    // Only allow wishlist owner to delete
    if (wishlist.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.wishlist.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
