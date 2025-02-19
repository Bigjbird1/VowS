import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateRegistryRequest } from "@/types/registry"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body: CreateRegistryRequest = await req.json()

    // Generate a unique URL for the registry
    const uniqueUrl = `${body.coupleName1.toLowerCase()}-${body.coupleName2?.toLowerCase() || "registry"}-${Date.now()}`
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const registry = await prisma.registry.create({
      data: {
        userId: session.user.id,
        title: body.title,
        eventDate: new Date(body.eventDate),
        eventType: body.eventType,
        description: body.description,
        privacyStatus: body.privacyStatus,
        status: "ACTIVE",
        coupleName1: body.coupleName1,
        coupleName2: body.coupleName2,
        eventLocation: body.eventLocation,
        coverImage: body.coverImage,
        thankyouMessage: body.thankyouMessage,
        uniqueUrl,
      },
    })

    return new NextResponse(JSON.stringify(registry), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error creating registry:", error)
    return new NextResponse("An error occurred while creating the registry", {
      status: 500,
    })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    
    const search = searchParams.get("search")?.toLowerCase()
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Base query
    const where = {
      OR: [
        { privacyStatus: "PUBLIC" },
        ...(session?.user
          ? [{ userId: session.user.id }]
          : []),
      ],
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { coupleName1: { contains: search, mode: "insensitive" } },
              { coupleName2: { contains: search, mode: "insensitive" } },
              { eventLocation: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [registries, total] = await Promise.all([
      prisma.registry.findMany({
        where,
        orderBy: { eventDate: "asc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.registry.count({ where }),
    ])

    return new NextResponse(
      JSON.stringify({
        registries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching registries:", error)
    return new NextResponse("An error occurred while fetching registries", {
      status: 500,
    })
  }
}
