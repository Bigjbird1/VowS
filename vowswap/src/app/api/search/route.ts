import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductFilters, SortOption } from '@/types/product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const filtersParam = searchParams.get('filters');
    const sortBy = searchParams.get('sortBy') as SortOption | null;

    const filters: ProductFilters = filtersParam ? JSON.parse(filtersParam) : {};

    // Build the where clause
    const where: Prisma.ProductWhereInput = {
      AND: [
        // Only show active products
        { status: 'ACTIVE' },

        // Search query
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } as Prisma.StringFilter },
            { description: { contains: query, mode: 'insensitive' } as Prisma.StringFilter },
            { tags: { has: query.toLowerCase() } },
          ],
        } : {},

        // Category filter
        filters.category ? { category: filters.category } : {},

        // Subcategory filter
        filters.subcategory ? { subcategory: filters.subcategory } : {},

        // Price range filter
        {
          AND: [
            filters.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters.maxPrice ? { price: { lte: filters.maxPrice } } : {},
          ],
        },

        // Free shipping filter
        filters.freeShippingOnly ? { freeShipping: true } : {},

        // Sale items filter
        filters.onSaleOnly ? { isOnSale: true } : {},

        // Rating filter
        filters.minRating ? { rating: { gte: filters.minRating } } : {},

        // Availability filter
        filters.availability === 'in_stock'
          ? { inventory: { gt: 0 } }
          : filters.availability === 'out_of_stock'
          ? { inventory: 0 }
          : {},

        // Tags filter
        filters.tags?.length
          ? { tags: { hasEvery: filters.tags } }
          : {},
      ],
    };

    // Build the orderBy clause
    const orderBy = (() => {
      switch (sortBy) {
        case 'price_asc':
          return { price: 'asc' as const };
        case 'price_desc':
          return { price: 'desc' as const };
        case 'newest':
          return { createdAt: 'desc' as const };
        case 'best_selling':
          return { salesCount: 'desc' as const };
        case 'rating':
          return { rating: 'desc' as const };
        case 'recently_added':
          return { createdAt: 'desc' as const };
        default:
          // Default sorting by relevance (if there's a search query) or newest
          return query ? { rating: 'desc' as const } : { createdAt: 'desc' as const };
      }
    })();

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        seller: {
          select: {
            storeName: true,
          },
        },
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Log search analytics if there's a query
    if (query) {
      await prisma.searchLog.create({
        data: {
          query,
          filters: filtersParam ? (JSON.parse(filtersParam) as Prisma.JsonObject) : Prisma.JsonNull,
          sorting: sortBy,
          results: total,
          userId: session?.user?.id,
        },
      });
    }

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPreviousPage,
        pageSize: PAGE_SIZE,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
