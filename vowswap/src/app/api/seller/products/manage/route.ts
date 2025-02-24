import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";

type ProductUpdateData = Prisma.ProductUpdateInput;

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const productId = body.productId;

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    // Get the product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (product.sellerId !== seller.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updateData: ProductUpdateData = {};

    // Only allow specific fields to be updated
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.price) updateData.price = body.price;
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice;
    if (typeof body.isOnSale === "boolean") updateData.isOnSale = body.isOnSale;
    if (body.category) updateData.category = body.category;
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory;
    if (body.condition) updateData.condition = body.condition;
    if (body.tags) updateData.tags = body.tags;
    if (typeof body.inventory === "number") updateData.inventory = body.inventory;
    if (typeof body.freeShipping === "boolean") updateData.freeShipping = body.freeShipping;
    if (body.status) updateData.status = body.status as ProductStatus;
    if (body.images) updateData.images = body.images;

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[PRODUCT_UPDATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    // Get the product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (product.sellerId !== seller.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Instead of deleting, mark the product as deleted
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.DELETED,
      },
    });

    return NextResponse.json(deletedProduct);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
