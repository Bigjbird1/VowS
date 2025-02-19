import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductFormData } from "@/types/product";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    const body = await request.json();
    const data: ProductFormData & { sellerId: string } = body;

    // Verify the sellerId matches
    if (data.sellerId !== seller.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate required fields
    if (!data.title || !data.description || !data.price || !data.category || !data.condition) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images,
        category: data.category,
        condition: data.condition,
        inventory: data.inventory,
        status: data.status,
        isVisible: data.status === "ACTIVE",
        viewCount: 0,
      },
    });

    // If this is the seller's first product, update their isActive status
    if (!seller.isActive) {
      await prisma.seller.update({
        where: { id: seller.id },
        data: { isActive: true },
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build filter conditions
    const where: any = {
      sellerId: seller.id,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get products with filters
    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
