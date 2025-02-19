import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SearchSuggestion } from '@/types/product';

interface ProductResult {
  title: string;
  category: string;
  tags: string[];
}

interface CategoryResult {
  category: string;
  _count: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Normalize the search query
    const normalizedQuery = query.toLowerCase().trim();

    // Get product suggestions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: normalizedQuery, mode: 'insensitive' } },
          { description: { contains: normalizedQuery, mode: 'insensitive' } },
          { tags: { has: normalizedQuery } },
        ],
        AND: [
          { status: 'ACTIVE' },
          { isVisible: true },
        ],
      },
      select: {
        title: true,
        category: true,
        tags: true,
      },
      take: 5,
    });

    // Get category suggestions
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: {
        category: { contains: normalizedQuery, mode: 'insensitive' },
        status: 'ACTIVE',
        isVisible: true,
      },
      _count: true,
      take: 3,
    });

    // Get tag suggestions
    const tagsAggregation = await prisma.product.findMany({
      where: {
        tags: { hasSome: [normalizedQuery] },
        status: 'ACTIVE',
        isVisible: true,
      },
      select: {
        tags: true,
      },
    });

    // Process tags
    const tagCounts = new Map<string, number>();
    tagsAggregation.forEach((product: { tags: string[] }) => {
      product.tags.forEach((tag: string) => {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      });
    });

    // Build suggestions array
    const suggestions: SearchSuggestion[] = [
      // Product title suggestions
      ...products.map((product: ProductResult) => ({
        type: 'product' as const,
        text: product.title,
        count: 1,
      })),

      // Category suggestions
      ...categories.map((category: CategoryResult) => ({
        type: 'category' as const,
        text: category.category,
        count: category._count,
      })),

      // Tag suggestions
      ...[...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag, count]) => ({
          type: 'tag' as const,
          text: tag,
          count,
        })),
    ];

    // Log the search query for analytics
    await prisma.searchLog.create({
      data: {
        query: normalizedQuery,
        results: suggestions.length,
      },
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}
