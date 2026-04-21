import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectMongo } from './_lib/mongo';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await connectMongo();
    res.status(200).json({ ok: true, ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
}
