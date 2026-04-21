import { contracts, getProvider } from '../chain';
import { Project } from '../models/Project';
import { Listing } from '../models/Listing';

const CHUNK = 45_000;

async function queryChunked<T>(
  contract: { queryFilter: (f: unknown, from: number, to: number) => Promise<T[]> },
  filter: unknown,
  from: number,
  to: number,
): Promise<T[]> {
  const out: T[] = [];
  for (let start = from; start <= to; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, to);
    const chunk = await contract.queryFilter(filter, start, end);
    out.push(...chunk);
  }
  return out;
}

async function backfill() {
  const { registry, market } = contracts();
  const provider = getProvider();
  const latest = await provider.getBlockNumber();
  // Scan last ~40k blocks (~5 days on Sepolia) — under public-RPC 50k limit per call.
  const fromBlock = Math.max(0, latest - 40_000);
  console.log(`[indexer] Backfilling events ${fromBlock} → ${latest}`);

  const registered = await queryChunked(
    registry,
    registry.filters.ProjectRegistered(),
    fromBlock,
    latest,
  );
  for (const ev of registered) {
    const [id, owner, cid] = (ev as unknown as { args: [bigint, string, string] }).args;
    await Project.updateOne(
      { projectId: Number(id) },
      { projectId: Number(id), owner: owner.toLowerCase(), ipfsCid: cid, approved: false },
      { upsert: true },
    );
  }

  const approved = await queryChunked(
    registry,
    registry.filters.ProjectApproved(),
    fromBlock,
    latest,
  );
  for (const ev of approved) {
    const [id] = (ev as unknown as { args: [bigint] }).args;
    await Project.updateOne({ projectId: Number(id) }, { approved: true });
  }

  const issued = await queryChunked(registry, registry.filters.CreditsIssued(), fromBlock, latest);
  for (const ev of issued) {
    const [id, amount] = (ev as unknown as { args: [bigint, bigint] }).args;
    await Project.updateOne({ projectId: Number(id) }, { totalIssued: amount.toString() });
  }

  const listed = await queryChunked(market, market.filters.Listed(), fromBlock, latest);
  for (const ev of listed) {
    const [id, seller, projectId, amount, price] = (
      ev as unknown as { args: [bigint, string, bigint, bigint, bigint] }
    ).args;
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
  }

  const cancelled = await queryChunked(market, market.filters.Cancelled(), fromBlock, latest);
  for (const ev of cancelled) {
    const [id] = (ev as unknown as { args: [bigint] }).args;
    await Listing.updateOne({ listingId: Number(id) }, { active: false, amount: '0' });
  }

  console.log(
    `[indexer] Backfill complete: registered=${registered.length} approved=${approved.length} issued=${issued.length} listed=${listed.length} cancelled=${cancelled.length}`,
  );
}

let lastScannedBlock = 0;

async function incrementalBackfill() {
  try {
    const provider = getProvider();
    const latest = await provider.getBlockNumber();
    if (latest <= lastScannedBlock) return;
    const from = lastScannedBlock === 0 ? Math.max(0, latest - 40_000) : lastScannedBlock + 1;
    lastScannedBlock = latest;
    await scanRange(from, latest);
  } catch (e) {
    console.warn('[indexer] incremental poll failed:', (e as Error).message);
  }
}

async function scanRange(fromBlock: number, latest: number) {
  const { registry, market } = contracts();

  const registered = await queryChunked(
    registry,
    registry.filters.ProjectRegistered(),
    fromBlock,
    latest,
  );
  for (const ev of registered) {
    const [id, owner, cid] = (ev as unknown as { args: [bigint, string, string] }).args;
    await Project.updateOne(
      { projectId: Number(id) },
      { projectId: Number(id), owner: owner.toLowerCase(), ipfsCid: cid, approved: false },
      { upsert: true },
    );
  }

  const approved = await queryChunked(
    registry,
    registry.filters.ProjectApproved(),
    fromBlock,
    latest,
  );
  for (const ev of approved) {
    const [id] = (ev as unknown as { args: [bigint] }).args;
    await Project.updateOne({ projectId: Number(id) }, { approved: true });
  }

  const issued = await queryChunked(registry, registry.filters.CreditsIssued(), fromBlock, latest);
  for (const ev of issued) {
    const [id, amount] = (ev as unknown as { args: [bigint, bigint] }).args;
    await Project.updateOne({ projectId: Number(id) }, { totalIssued: amount.toString() });
  }

  const listed = await queryChunked(market, market.filters.Listed(), fromBlock, latest);
  for (const ev of listed) {
    const [id, seller, projectId, amount, price] = (
      ev as unknown as { args: [bigint, string, bigint, bigint, bigint] }
    ).args;
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
  }

  const sold = await queryChunked(market, market.filters.Sold(), fromBlock, latest);
  for (const ev of sold) {
    const [id, , amount] = (ev as unknown as { args: [bigint, string, bigint] }).args;
    const existing = await Listing.findOne({ listingId: Number(id) });
    if (existing) {
      const remaining = BigInt(existing.amount) - amount;
      await Listing.updateOne(
        { listingId: Number(id) },
        { amount: remaining.toString(), active: remaining > 0n },
      );
    }
  }

  const cancelled = await queryChunked(market, market.filters.Cancelled(), fromBlock, latest);
  for (const ev of cancelled) {
    const [id] = (ev as unknown as { args: [bigint] }).args;
    await Listing.updateOne({ listingId: Number(id) }, { active: false, amount: '0' });
  }

  if (
    registered.length +
      approved.length +
      issued.length +
      listed.length +
      sold.length +
      cancelled.length >
    0
  ) {
    console.log(
      `[indexer] Synced ${fromBlock}→${latest}: registered=${registered.length} approved=${approved.length} issued=${issued.length} listed=${listed.length} sold=${sold.length} cancelled=${cancelled.length}`,
    );
  }
}

export async function startIndexer() {
  await backfill();
  const provider = getProvider();
  lastScannedBlock = await provider.getBlockNumber();
  // Poll every 20s as a safety net in case the WebSocket subscription misses events.
  setInterval(incrementalBackfill, 20_000);

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
