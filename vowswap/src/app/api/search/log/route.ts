import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProductFilters, SortOption } from '@/types/product';

interface SearchLogRequest {
  query: string;
  filters?: ProductFilters;
  sorting?: SortOption;
  resultCount: number;
  clickedProductId?: string;
}

interface PopularSearch {
  query: string;
  _count: {
    query: number;
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { query, filters, sorting, resultCount, clickedProductId } = await request.json() as SearchLogRequest;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const searchLog = await prisma.searchLog.create({
      data: {
        query,
        filters: filters ? JSON.stringify(filters) : null,
        sorting,
        results: resultCount,
        clickedId: clickedProductId,
        userId: session?.user?.id,
      },
    });

    return NextResponse.json({ success: true, searchLog });
  } catch (error) {
    console.error('Search log error:', error);
    return NextResponse.json(
      { error: 'Failed to log search' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search analytics for the user
    const searchLogs = await prisma.searchLog.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 searches
      include: {
        clickedProduct: {
          select: {
            title: true,
            category: true,
          },
        },
      },
    });

    // Get popular searches
    const popularSearches = await prisma.searchLog.groupBy({
      by: ['query'],
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    return NextResponse.json({
      userSearches: searchLogs,
      popularSearches: popularSearches.map((search: PopularSearch) => ({
        query: search.query,
        count: search._count.query,
      })),
    });
  } catch (error) {
    console.error('Get search logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search logs' },
      { status: 500 }
    );
  }
}
