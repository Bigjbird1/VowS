import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateRegistryRequest, RegistryItem, GiftContribution } from "@/types/registry"

type RegistryItemWithDetails = RegistryItem & {
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

    // Filter out user information for anonymous contributions
    const filteredItems = (registry.items as RegistryItemWithDetails[]).map((item) => ({
      ...item,
      contributions: item.contributions.map((contribution) => ({
        ...contribution,
        user: contribution.anonymous ? null : contribution.user,
      })),
    }))

    const response = {
      ...registry,
      items: filteredItems,
    }

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching registry:", error)
    return new NextResponse("An error occurred while fetching the registry", {
      status: 500,
    })
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

    const registry = await prisma.registry.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!registry) {
      return new NextResponse("Registry not found", { status: 404 })
    }

    // Only registry owner can update
    if (registry.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: UpdateRegistryRequest = await req.json()

    const updatedRegistry = await prisma.registry.update({
      where: { id: params.id },
      data: {
        title: body.title,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        eventType: body.eventType,
        description: body.description,
        privacyStatus: body.privacyStatus,
        status: body.status,
        coupleName1: body.coupleName1,
        coupleName2: body.coupleName2,
        eventLocation: body.eventLocation,
        coverImage: body.coverImage,
        thankyouMessage: body.thankyouMessage,
      },
    })

    return new NextResponse(JSON.stringify(updatedRegistry), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error updating registry:", error)
    return new NextResponse("An error occurred while updating the registry", {
      status: 500,
    })
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

    const registry = await prisma.registry.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            contributions: true,
          },
        },
      },
    })

    if (!registry) {
      return new NextResponse("Registry not found", { status: 404 })
    }

    // Only registry owner can delete
    if (registry.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if any items have contributions
    const hasContributions = registry.items.some(
      (item: RegistryItemWithDetails) => item.contributions.length > 0
    )
    if (hasContributions) {
      return new NextResponse(
        "Cannot delete registry with existing contributions",
        { status: 400 }
      )
    }

    // Delete all items and the registry
    await prisma.$transaction([
      prisma.registryItem.deleteMany({
        where: { registryId: params.id },
      }),
      prisma.registry.delete({
        where: { id: params.id },
      }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting registry:", error)
    return new NextResponse("An error occurred while deleting the registry", {
      status: 500,
    })
  }
}
