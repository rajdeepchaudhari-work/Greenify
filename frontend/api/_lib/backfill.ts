import type { Contract, EventLog, Log } from 'ethers';
import { contracts, getProvider } from './chain';
import { Project, Listing, Meta } from './models';

const CHUNK = 45_000;
const LAST_BLOCK_KEY = 'indexer:lastBlock';

async function queryChunked(
  contract: Contract,
  filter: Parameters<Contract['queryFilter']>[0],
  from: number,
  to: number,
): Promise<(EventLog | Log)[]> {
  const out: (EventLog | Log)[] = [];
  for (let start = from; start <= to; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, to);
    const chunk = await contract.queryFilter(filter, start, end);
    out.push(...chunk);
  }
  return out;
}

async function getLastBlock(): Promise<number | null> {
  const doc = await Meta.findOne({ key: LAST_BLOCK_KEY });
  return doc?.value?.block ?? null;
}

async function setLastBlock(block: number) {
  await Meta.updateOne(
    { key: LAST_BLOCK_KEY },
    { $set: { key: LAST_BLOCK_KEY, value: { block } } },
    { upsert: true },
  );
}

export interface SyncResult {
  fromBlock: number;
  toBlock: number;
  counts: {
    registered: number;
    approved: number;
    issued: number;
    listed: number;
    sold: number;
    cancelled: number;
  };
}

export async function runSync(): Promise<SyncResult> {
  const { registry, market } = contracts();
  const provider = getProvider();
  const latest = await provider.getBlockNumber();

  const stored = await getLastBlock();
  const fromBlock = stored !== null ? stored + 1 : Math.max(0, latest - 40_000);
  if (fromBlock > latest) {
    return {
      fromBlock,
      toBlock: latest,
      counts: { registered: 0, approved: 0, issued: 0, listed: 0, sold: 0, cancelled: 0 },
    };
  }

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

  await setLastBlock(latest);

  return {
    fromBlock,
    toBlock: latest,
    counts: {
      registered: registered.length,
      approved: approved.length,
      issued: issued.length,
      listed: listed.length,
      sold: sold.length,
      cancelled: cancelled.length,
    },
  };
}
