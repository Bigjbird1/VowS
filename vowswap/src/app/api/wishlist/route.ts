import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateWishlistRequest } from "@/types/wishlist"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: CreateWishlistRequest = await req.json()

    const wishlist = await prisma.wishlist.create({
      data: {
        ...body,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("[WISHLIST_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const wishlists = await prisma.wishlist.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isPublic: true },
        ],
      },
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
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(wishlists)
  } catch (error) {
    console.error("[WISHLIST_LIST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
