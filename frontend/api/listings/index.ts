import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectMongo } from '../_lib/mongo';
import { Listing } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectMongo();
    const filter: Record<string, unknown> = {};
    if (req.query.active === 'true') filter.active = true;
    if (req.query.seller) filter.seller = String(req.query.seller).toLowerCase();
    const listings = await Listing.find(filter).sort({ listingId: -1 }).limit(200).lean();
    res.status(200).json(listings);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
