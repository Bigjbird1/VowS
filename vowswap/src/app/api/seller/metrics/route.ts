import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/types/order";

interface OrderItemWithRelations {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    status: OrderStatus;
    createdAt: Date;
  };
  product: {
    id: string;
    title: string;
  };
}

interface ProductPerformance {
  id: string;
  title: string;
  sales: number;
  revenue: number;
}

interface AnalyticsData {
  id: string;
  sellerId: string;
  date: Date;
  revenue: number;
  orderCount: number;
  viewCount: number;
  conversionRate: number;
  createdAt: Date;
}

export async function GET() {
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

    // Get orders for this seller's products
    const orders = await prisma.orderItem.findMany({
      where: {
        product: {
          sellerId: seller.id,
        },
      },
      include: {
        order: true,
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as OrderItemWithRelations[];

    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, item: OrderItemWithRelations) => 
      sum + (item.price * item.quantity), 0);
    const totalOrders = new Set(orders.map((item: OrderItemWithRelations) => item.orderId)).size;
    const productsSold = orders.reduce((sum: number, item: OrderItemWithRelations) => 
      sum + item.quantity, 0);

    // Get product performance
    const productPerformance = orders.reduce((acc: Record<string, ProductPerformance>, item: OrderItemWithRelations) => {
      const productId = item.productId;
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          title: item.product.title,
          sales: 0,
          revenue: 0,
        };
      }
      acc[productId].sales += item.quantity;
      acc[productId].revenue += item.price * item.quantity;
      return acc;
    }, {});

    // Get recent orders
    const recentOrders = Array.from(
      new Set(orders.map((item: OrderItemWithRelations) => item.orderId))
    ).slice(0, 5).map((orderId: string) => {
      const orderItems = orders.filter((item: OrderItemWithRelations) => item.orderId === orderId);
      const order = orderItems[0].order;
      return {
        id: orderId,
        date: order.createdAt,
        total: orderItems.reduce((sum: number, item: OrderItemWithRelations) => 
          sum + (item.price * item.quantity), 0),
        status: order.status,
      };
    });

    // Get performance metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await prisma.sellerAnalytics.findMany({
      where: {
        sellerId: seller.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "desc",
      },
    }) as AnalyticsData[];

    const averageConversionRate = analytics.length > 0
      ? analytics.reduce((sum: number, day: AnalyticsData) => 
          sum + day.conversionRate, 0) / analytics.length
      : 0;

    const metrics = {
      totalRevenue,
      totalOrders,
      productsSold,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      topProducts: Object.values(productPerformance)
        .sort((a: ProductPerformance, b: ProductPerformance) => b.revenue - a.revenue)
        .slice(0, 5),
      recentOrders,
      performanceMetrics: {
        viewCount: analytics.reduce((sum: number, day: AnalyticsData) => 
          sum + day.viewCount, 0),
        conversionRate: averageConversionRate,
        averageRating: seller.rating || 0,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[SELLER_METRICS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
