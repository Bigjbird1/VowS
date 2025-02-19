import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SearchSuggestion } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Fuzzy search using Prisma's contains
    const [products, categories, tags] = await Promise.all([
      // Search products
      prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          AND: [
            { isVisible: true },
            { status: 'ACTIVE' },
          ],
        },
        select: {
          title: true,
        },
        take: 5,
      }),

      // Search unique categories
      prisma.product.groupBy({
        by: ['category'],
        where: {
          category: { contains: query, mode: 'insensitive' },
          AND: [
            { isVisible: true },
            { status: 'ACTIVE' },
          ],
        },
        _count: true,
      }),

      // Search unique tags
      prisma.product.findMany({
        where: {
          tags: { has: query.toLowerCase() },
          AND: [
            { isVisible: true },
            { status: 'ACTIVE' },
          ],
        },
        select: {
          tags: true,
        },
      }),
    ]);

    // Process tags to get unique ones with counts
    const tagCounts = tags.reduce((acc, product) => {
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          acc[tag] = (acc[tag] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    // Build suggestions array
    const suggestions: SearchSuggestion[] = [
      // Product suggestions
      ...products.map(product => ({
        type: 'product' as const,
        text: product.title,
        count: 1,
      })),

      // Category suggestions
      ...categories.map(category => ({
        type: 'category' as const,
        text: category.category,
        count: category._count,
      })),

      // Tag suggestions
      ...Object.entries(tagCounts).map(([tag, count]) => ({
        type: 'tag' as const,
        text: tag,
        count,
      })),
    ];

    // Sort suggestions by relevance (exact matches first, then partial matches)
    suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === query.toLowerCase();
      const bExact = b.text.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return b.count - a.count;
    });

    // Limit to top 10 suggestions
    const limitedSuggestions = suggestions.slice(0, 10);

    return NextResponse.json({ suggestions: limitedSuggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}
