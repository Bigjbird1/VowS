import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ searches: [] });
    }

    const searchHistory = await prisma.searchHistory.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      searches: searchHistory ? (searchHistory.searches as string[]) : [],
    });
  } catch (error) {
    console.error('Get search history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get existing history or create new
    const existingHistory = await prisma.searchHistory.findUnique({
      where: { userId: session.user.id },
    });

    if (existingHistory) {
      // Update existing history
      const searches = existingHistory.searches as string[];
      const updatedSearches = [
        query,
        ...searches.filter(s => s !== query),
      ].slice(0, 10); // Keep only last 10 searches

      await prisma.searchHistory.update({
        where: { userId: session.user.id },
        data: { searches: updatedSearches },
      });

      return NextResponse.json({ searches: updatedSearches });
    } else {
      // Create new history
      const newHistory = await prisma.searchHistory.create({
        data: {
          userId: session.user.id,
          searches: [query],
        },
      });

      return NextResponse.json({ searches: newHistory.searches });
    }
  } catch (error) {
    console.error('Update search history error:', error);
    return NextResponse.json(
      { error: 'Failed to update search history' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.searchHistory.update({
      where: { userId: session.user.id },
      data: { searches: [] },
    });

    return NextResponse.json({ message: 'Search history cleared' });
  } catch (error) {
    console.error('Clear search history error:', error);
    return NextResponse.json(
      { error: 'Failed to clear search history' },
      { status: 500 }
    );
  }
}
