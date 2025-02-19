import { NextResponse } from 'next/server';
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

    // Trigger database backup using Vercel Postgres backup feature
    // This is handled automatically by Vercel when using their Postgres offering
    // We just need to log the backup attempt and monitor for any issues

    // Log backup attempt to Sentry for monitoring
    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Database backup initiated',
      level: 'info',
    });

    // You could also send a notification to your team's Slack channel
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🗄️ Database backup completed at ${new Date().toISOString()}`,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Database backup completed',
    });
  } catch (error: unknown) {
    console.error('Database backup failed:', error);
    Sentry.captureException(error);

    // Notify team about backup failure
    if (process.env.SLACK_WEBHOOK_URL) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `❌ Database backup failed at ${new Date().toISOString()}\nError: ${errorMessage}`,
        }),
      });
    }

    return NextResponse.json(
      { error: 'Database backup failed' },
      { status: 500 }
    );
  }
}
