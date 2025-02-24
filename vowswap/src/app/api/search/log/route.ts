import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SearchAnalytics } from '@/types/product';
import { Prisma } from '@prisma/client';
import { UserRole } from '@/types/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { query, filters, sorting, resultCount, clickedProductId }: SearchAnalytics = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Create search log entry
    await prisma.searchLog.create({
      data: {
        query,
        filters: filters ? (filters as Prisma.JsonObject) : Prisma.JsonNull,
        sorting: sorting,
        results: resultCount,
        clickedId: clickedProductId,
        userId: session?.user?.id, // Optional: only logged for authenticated users
      },
    });

    // If a product was clicked, increment its view count
    if (clickedProductId) {
      await prisma.product.update({
        where: { id: clickedProductId },
        data: {
          salesCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search log error:', error);
    return NextResponse.json(
      { error: 'Failed to log search analytics' },
      { status: 500 }
    );
  }
}

// GET endpoint for analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin using raw query to ensure type safety
    const adminCheck = await prisma.$queryRaw<{ role: UserRole }[]>`
      SELECT role FROM "User" WHERE id = ${session.user.id}
    `;

    if (!adminCheck.length || adminCheck[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get search analytics
    const [
      totalSearches,
      popularQueries,
      popularFilters,
      clickThroughRate,
    ] = await Promise.all([
      // Total number of searches
      prisma.searchLog.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Most popular search queries
      prisma.$queryRaw<{ query: string; count: bigint }[]>`
        SELECT query, COUNT(*) as count
        FROM "SearchLog"
        WHERE "createdAt" >= ${startDate}
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `,

      // Most used filters
      prisma.searchLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
          filters: {
            not: Prisma.JsonNull,
          },
        },
        select: {
          filters: true,
        },
      }),

      // Click-through rate
      prisma.searchLog.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          clickedId: true,
          _all: true,
        },
      }),
    ]);

    // Process filter data
    type FilterValue = string | number | boolean | string[];
    
    const filterCounts: Record<string, number> = {};
    popularFilters.forEach(log => {
      const filters = log.filters as Record<string, FilterValue>;
      Object.keys(filters).forEach(key => {
        filterCounts[key] = (filterCounts[key] || 0) + 1;
      });
    });

    // Calculate click-through rate
    const ctr = clickThroughRate._count.clickedId / clickThroughRate._count._all;

    // Format popular queries
    const formattedQueries = popularQueries.map(q => ({
      query: q.query,
      count: Number(q.count),
    }));

    return NextResponse.json({
      totalSearches,
      popularQueries: formattedQueries,
      popularFilters: Object.entries(filterCounts)
        .map(([key, count]) => ({ filter: key, count }))
        .sort((a, b) => b.count - a.count),
      clickThroughRate: ctr,
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}
