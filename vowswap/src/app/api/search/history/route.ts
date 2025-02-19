import { NextRequest, NextResponse } from 'next/server';
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

    if (!searchHistory) {
      return NextResponse.json({ searches: [] });
    }

    // Parse the JSON array of searches
    const searches = searchHistory.searches as string[];
    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Search history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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

    let searches = existingHistory
      ? (existingHistory.searches as string[])
      : [];

    // Remove the query if it already exists and add it to the beginning
    searches = [
      query,
      ...searches.filter(q => q !== query),
    ].slice(0, 10); // Keep only last 10 searches

    // Upsert the search history
    await prisma.searchHistory.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        searches: searches,
      },
      update: {
        searches: searches,
      },
    });

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Search history error:', error);
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
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await prisma.searchHistory.update({
      where: { userId: session.user.id },
      data: { searches: [] },
    });

    return NextResponse.json({ searches: [] });
  } catch (error) {
    console.error('Search history error:', error);
    return NextResponse.json(
      { error: 'Failed to clear search history' },
      { status: 500 }
    );
  }
}
