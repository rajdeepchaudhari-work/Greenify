import { contracts } from '../chain';
import { Project } from '../models/Project';
import { Listing } from '../models/Listing';

export function startIndexer() {
  const { registry, market } = contracts();

  registry.on('ProjectRegistered', async (id: bigint, owner: string, cid: string) => {
    await Project.updateOne(
      { projectId: Number(id) },
      { projectId: Number(id), owner: owner.toLowerCase(), ipfsCid: cid, approved: false },
      { upsert: true },
    );
    console.log(`[indexer] Project ${id} registered by ${owner}`);
  });

  registry.on('ProjectApproved', async (id: bigint) => {
    await Project.updateOne({ projectId: Number(id) }, { approved: true });
    console.log(`[indexer] Project ${id} approved`);
  });

  registry.on('CreditsIssued', async (id: bigint, amount: bigint) => {
    await Project.updateOne(
      { projectId: Number(id) },
      { $inc: { totalIssued: 0 }, totalIssued: amount.toString() },
    );
    console.log(`[indexer] Project ${id} +${amount} credits`);
  });

  market.on(
    'Listed',
    async (id: bigint, seller: string, projectId: bigint, amount: bigint, price: bigint) => {
      await Listing.updateOne(
        { listingId: Number(id) },
        {
          listingId: Number(id),
          seller: seller.toLowerCase(),
          projectId: Number(projectId),
          amount: amount.toString(),
          pricePerUnit: price.toString(),
          active: true,
        },
        { upsert: true },
      );
      console.log(`[indexer] Listing ${id} created`);
    },
  );

  market.on('Sold', async (id: bigint, _buyer: string, amount: bigint) => {
    const existing = await Listing.findOne({ listingId: Number(id) });
    if (existing) {
      const remaining = BigInt(existing.amount) - amount;
      await Listing.updateOne(
        { listingId: Number(id) },
        { amount: remaining.toString(), active: remaining > 0n },
      );
    }
  });

  market.on('Cancelled', async (id: bigint) => {
    await Listing.updateOne({ listingId: Number(id) }, { active: false, amount: '0' });
  });

  console.log('[indexer] Listening to contract events');
}
