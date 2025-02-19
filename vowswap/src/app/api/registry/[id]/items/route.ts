import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RegistryItem, GiftContribution } from "@/types/registry"

type PrismaRegistryItem = RegistryItem & {
  product: {
    id: string
    title: string
    price: number
    images: string[]
    category: string
  } | null
  contributions: (GiftContribution & {
    user: {
      name: string | null
    } | null
  })[]
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const registry = await prisma.registry.findUnique({
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
            contributions: {
              select: {
                id: true,
                amount: true,
                message: true,
                anonymous: true,
                createdAt: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!registry) {
      return new NextResponse("Registry not found", { status: 404 })
    }

    // Check privacy settings
    if (
      registry.privacyStatus === "PRIVATE" &&
      registry.userId !== session?.user?.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Filter out items with missing products
    const validItems = (registry.items as PrismaRegistryItem[])
      .filter((item) => item.product !== null)
      .map((item) => ({
        ...item,
        contributions: item.contributions.map((contribution) => ({
          ...contribution,
          // Only show contributor name if not anonymous
          user: contribution.anonymous ? null : contribution.user,
        })),
      }))

    return new NextResponse(JSON.stringify(validItems), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching registry items:", error)
    return new NextResponse("An error occurred while fetching registry items", {
      status: 500,
    })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const registry = await prisma.registry.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!registry) {
      return new NextResponse("Registry not found", { status: 404 })
    }

    // Only registry owner can add items
    if (registry.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const item = await prisma.registryItem.create({
      data: {
        registryId: params.id,
        productId: body.productId,
        quantity: body.quantity,
        priority: body.priority || "LOW",
        status: "AVAILABLE",
        note: body.note,
        customItem: body.customItem || false,
        customItemDetails: body.customItemDetails,
      },
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
        contributions: true,
      },
    })

    return new NextResponse(JSON.stringify(item), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error adding registry item:", error)
    return new NextResponse("An error occurred while adding the registry item", {
      status: 500,
    })
  }
}
