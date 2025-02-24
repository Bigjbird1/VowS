import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AddGiftContributionRequest } from "@/types/registry"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: AddGiftContributionRequest = await req.json()

    // Verify the item exists and belongs to the registry
    const item = await prisma.registryItem.findFirst({
      where: {
        id: params.itemId,
        registryId: params.id,
      },
      include: {
        product: true,
        contributions: true,
      },
    })

    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    if (item.status === "PURCHASED") {
      return new NextResponse("Item has already been purchased", { status: 400 })
    }

    if (!item.product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // Calculate total contributions including the new one
    const currentTotal = item.contributions.reduce(
      (sum: number, contribution: { amount: number }) => sum + contribution.amount,
      0
    )
    const newTotal = currentTotal + body.amount

    // Check if contribution would exceed the item price
    if (newTotal > item.product.price) {
      return new NextResponse(
        `Contribution amount exceeds remaining balance. Maximum contribution: $${
          item.product.price - currentTotal
        }`,
        { status: 400 }
      )
    }

    // Create the contribution
    const contribution = await prisma.giftContribution.create({
      data: {
        registryItemId: item.id,
        userId: session.user.id,
        amount: body.amount,
        message: body.message,
        anonymous: body.anonymous || false,
      },
    })

    // Update item status if fully funded
    if (newTotal === item.product.price) {
      await prisma.registryItem.update({
        where: { id: item.id },
        data: {
          status: "PURCHASED",
        },
      })
    } else if (item.status === "AVAILABLE" && newTotal > 0) {
      await prisma.registryItem.update({
        where: { id: item.id },
        data: {
          status: "RESERVED",
        },
      })
    }

    return new NextResponse(JSON.stringify(contribution), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error processing contribution:", error)
    return new NextResponse(
      "An error occurred while processing your contribution",
      { status: 500 }
    )
  }
}
