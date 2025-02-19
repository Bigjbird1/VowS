import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductFilters, SortOption } from '@/types/product';
import { Prisma } from '@prisma/client';

const PAGE_SIZE = 12;

interface SearchParams {
  q?: string;
  page?: string;
  filters?: ProductFilters;
  sortBy?: SortOption;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const filtersParam = searchParams.get('filters');
    const sortBy = searchParams.get('sortBy') as SortOption | null;

    const filters: ProductFilters = filtersParam ? JSON.parse(filtersParam) : {};

    // Build the where clause
    const where: Prisma.ProductWhereInput = {
      AND: [
        // Status and visibility
        { status: 'ACTIVE' },
        { isVisible: true },

        // Search query
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
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
    const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
      switch (sortBy) {
        case 'price_asc':
          return { price: 'asc' };
        case 'price_desc':
          return { price: 'desc' };
        case 'newest':
          return { createdAt: 'desc' };
        case 'best_selling':
          return { salesCount: 'desc' };
        case 'rating':
          return { rating: 'desc' };
        case 'recently_added':
          return { createdAt: 'desc' };
        default:
          // Default sorting by relevance (if there's a search query) or newest
          return query ? { rating: 'desc' } : { createdAt: 'desc' };
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
            name: true,
          },
        },
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

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
