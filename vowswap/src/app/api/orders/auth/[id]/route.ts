/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: any
) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const orderData = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              title: true,
              images: true,
              price: true,
              sellerId: true,
            },
          },
        },
      },
      statusHistory: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!orderData) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Check authorization based on user role
  if (user.role === 'ADMIN' || 
      (user.role === 'SELLER' && orderData.items.some(item => item.product.sellerId === session.user.id)) ||
      orderData.userId === session.user.id) {
    return NextResponse.json({
      order: {
        ...orderData,
        paymentIntent: orderData.paymentIntent ?? undefined,
        trackingNumber: orderData.trackingNumber ?? undefined,
        notes: orderData.notes ?? undefined,
      }
    });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
