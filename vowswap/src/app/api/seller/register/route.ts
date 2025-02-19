import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { SellerFormData } from "@/types/seller";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, storeName, description, contactEmail, phoneNumber }: SellerFormData & { userId: string } = body;

    // Verify the authenticated user matches the requested userId
    if (session.user.id !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is already a seller
    const existingSeller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (existingSeller) {
      return new NextResponse("User is already a seller", { status: 400 });
    }

    // Create seller profile with default settings in a transaction
    const seller = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
      // Create seller profile
      const seller = await tx.seller.create({
        data: {
          userId,
          storeName,
          description,
          contactEmail,
          phoneNumber,
          verificationStatus: "PENDING",
          isActive: false,
        },
      });

      // Create default seller settings
      await tx.sellerSettings.create({
        data: {
          sellerId: seller.id,
          payoutSchedule: "WEEKLY",
          notifyNewOrders: true,
          notifyLowStock: true,
          lowStockThreshold: 5,
          autoRelist: false,
        },
      });

      // Create welcome notification
      await tx.sellerNotification.create({
        data: {
          sellerId: seller.id,
          type: "NEW_ORDER",
          message: "Welcome to VowSwap! Complete your profile to start selling.",
          isRead: false,
        },
      });

      return seller;
    });

    // Update user role to include seller
    await prisma.user.update({
      where: { id: userId },
      data: { role: "seller" },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error("[SELLER_REGISTER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
