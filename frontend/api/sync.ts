import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectMongo } from './_lib/mongo';
import { config, assertContractAddresses } from './_lib/config';
import { runSync } from './_lib/backfill';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Accept Vercel Cron calls (they include an Authorization header with CRON_SECRET when set)
  // and manual GET invocations. Gate writes behind a shared secret if configured.
  if (config.cronSecret) {
    const provided =
      req.headers.authorization?.replace('Bearer ', '') ??
      (Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret);
    if (provided !== config.cronSecret) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  try {
    assertContractAddresses();
    await connectMongo();
    const result = await runSync();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
