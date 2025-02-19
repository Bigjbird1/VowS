import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductUpdateInput } from "@/types/product";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (product.sellerId !== seller.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const updateData: ProductUpdateInput = {};

    // Only allow specific fields to be updated
    if (typeof body.isVisible === "boolean") {
      updateData.isVisible = body.isVisible;
    }
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.price) updateData.price = body.price;
    if (body.category) updateData.category = body.category;
    if (body.condition) updateData.condition = body.condition;
    if (typeof body.inventory === "number") updateData.inventory = body.inventory;
    if (body.status) updateData.status = body.status;
    if (body.images) updateData.images = body.images;

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[PRODUCT_UPDATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (product.sellerId !== seller.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Instead of deleting, archive the product
    const archivedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        status: "ARCHIVED",
        isVisible: false,
      },
    });

    return NextResponse.json(archivedProduct);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
