import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateRegistryItemRequest, GiftContribution } from "@/types/registry"

type ContributionWithUser = GiftContribution & {
  user: {
    name: string | null
  } | null
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const item = await prisma.registryItem.findFirst({
      where: {
        id: params.itemId,
        registryId: params.id,
      },
      include: {
        registry: {
          select: {
            userId: true,
            privacyStatus: true,
          },
        },
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
    })

    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Check privacy settings
    if (
      item.registry.privacyStatus === "PRIVATE" &&
      item.registry.userId !== session?.user?.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Filter out user information for anonymous contributions
    const filteredContributions = item.contributions.map((contribution: ContributionWithUser) => ({
      ...contribution,
      user: contribution.anonymous ? null : contribution.user,
    }))

    const response = {
      ...item,
      contributions: filteredContributions,
      registry: undefined, // Remove registry data from response
    }

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching registry item:", error)
    return new NextResponse("An error occurred while fetching the registry item", {
      status: 500,
    })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const item = await prisma.registryItem.findFirst({
      where: {
        id: params.itemId,
        registryId: params.id,
      },
      include: {
        registry: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Only registry owner can update items
    if (item.registry.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: UpdateRegistryItemRequest = await req.json()

    const updatedItem = await prisma.registryItem.update({
      where: {
        id: params.itemId,
      },
      data: {
        quantity: body.quantity,
        priority: body.priority,
        note: body.note,
        status: body.status,
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

    return new NextResponse(JSON.stringify(updatedItem), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error updating registry item:", error)
    return new NextResponse("An error occurred while updating the registry item", {
      status: 500,
    })
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

    const item = await prisma.registryItem.findFirst({
      where: {
        id: params.itemId,
        registryId: params.id,
      },
      include: {
        registry: {
          select: {
            userId: true,
          },
        },
        contributions: true,
      },
    })

    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Only registry owner can delete items
    if (item.registry.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if item has contributions
    if (item.contributions.length > 0) {
      return new NextResponse(
        "Cannot delete item with existing contributions",
        { status: 400 }
      )
    }

    await prisma.registryItem.delete({
      where: {
        id: params.itemId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting registry item:", error)
    return new NextResponse("An error occurred while deleting the registry item", {
      status: 500,
    })
  }
}
