import { Router } from 'express';
import { Listing } from '../models/Listing';

const router = Router();

router.get('/', async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.active === 'true') filter.active = true;
  if (req.query.seller) filter.seller = String(req.query.seller).toLowerCase();
  const listings = await Listing.find(filter).sort({ listingId: -1 }).limit(200);
  res.json(listings);
});

router.get('/:id', async (req, res) => {
  const listing = await Listing.findOne({ listingId: Number(req.params.id) });
  if (!listing) return res.status(404).json({ error: 'Not found' });
  res.json(listing);
});

export default router;
