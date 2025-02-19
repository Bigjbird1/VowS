import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Clean up old search logs (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedSearchLogs = await prisma.searchLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Clean up expired registries (past event date)
    const now = new Date();
    const expiredRegistries = await prisma.registry.updateMany({
      where: {
        eventDate: {
          lt: now,
        },
        status: 'ACTIVE',
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // Clean up old search history data (keep last 100 searches per user)
    const searchHistories = await prisma.searchHistory.findMany();
    let cleanedSearchHistories = 0;

    for (const history of searchHistories) {
      const searches = JSON.parse(history.searches as string);
      if (Array.isArray(searches) && searches.length > 100) {
        await prisma.searchHistory.update({
          where: { id: history.id },
          data: {
            searches: JSON.stringify(searches.slice(-100)),
          },
        });
        cleanedSearchHistories++;
      }
    }

    return NextResponse.json({
      success: true,
      deletedSearchLogs: deletedSearchLogs.count,
      expiredRegistries: expiredRegistries.count,
      cleanedSearchHistories,
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
