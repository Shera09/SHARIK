import { NextRequest } from 'next/server';
import { checkRateLimit, jsonError, jsonSuccess } from '@/lib/api-middleware';
import { runBackgroundWorker } from '@/lib/services/worker';

export async function GET(req: NextRequest) {
  return handleCronWorker(req);
}

export async function POST(req: NextRequest) {
  return handleCronWorker(req);
}

async function handleCronWorker(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'sharik_cron_secret_2026';

  // Verify CRON_SECRET authorization
  if (authHeader !== `Bearer ${cronSecret}` && req.nextUrl.searchParams.get('key') !== cronSecret) {
    return jsonError('Unauthorized: Invalid CRON_SECRET token', 401);
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = await checkRateLimit(ip, 'api/cron/worker', 60);
  if (!allowed) {
    return jsonError('Rate limit exceeded', 429);
  }

  const batchSize = Number(req.nextUrl.searchParams.get('batchSize') || 20);
  const result = await runBackgroundWorker(batchSize);

  return jsonSuccess(result, 'Background worker executed successfully');
}
