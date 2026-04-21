import { useEffect, useState } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { fetchListings, ListingRecord } from '../lib/api';
import { addresses, creditAbi, marketAbi } from '../lib/contracts';

export default function Market() {
  const { address, signer } = useWallet();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  // list form
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [priceEth, setPriceEth] = useState('');

  async function reload() {
    setListings(await fetchListings());
  }
  useEffect(() => {
    reload();
  }, []);

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    if (!signer) return;
    try {
      setBusy(-1);
      const credit = new Contract(addresses.credit, creditAbi, signer);
      const approved = await credit.isApprovedForAll(await signer.getAddress(), addresses.market);
      if (!approved) {
        const txa = await credit.setApprovalForAll(addresses.market, true);
        await txa.wait();
      }
      const market = new Contract(addresses.market, marketAbi, signer);
      const tx = await market.list(projectId, amount, parseEther(priceEth));
      await tx.wait();
      setProjectId('');
      setAmount('');
      setPriceEth('');
      setTimeout(reload, 1500);
    } finally {
      setBusy(null);
    }
  }

  async function buy(l: ListingRecord, qty: string) {
    if (!signer) return;
    try {
      setBusy(l.listingId);
      const market = new Contract(addresses.market, marketAbi, signer);
      const total = BigInt(qty) * BigInt(l.pricePerUnit);
      const tx = await market.buy(l.listingId, qty, { value: total });
      await tx.wait();
      reload();
    } finally {
      setBusy(null);
    }
  }

  async function cancel(l: ListingRecord) {
    if (!signer) return;
    try {
      setBusy(l.listingId);
      const market = new Contract(addresses.market, marketAbi, signer);
      const tx = await market.cancel(l.listingId);
      await tx.wait();
      reload();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <div className="brutal-card p-6 md:col-span-1">
        <h2 className="mb-4 text-2xl uppercase">New listing</h2>
        <form className="space-y-3" onSubmit={createListing}>
          <input
            className="brutal-input"
            placeholder="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
          <input
            className="brutal-input"
            placeholder="Amount (tonnes)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            className="brutal-input"
            placeholder="Price per unit (ETH)"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
            required
          />
          <button className="brutal-btn" type="submit" disabled={busy === -1 || !address}>
            {busy === -1 ? 'Submitting…' : 'List credits'}
          </button>
        </form>
      </div>

      <div className="brutal-card p-6 md:col-span-2">
        <h2 className="mb-4 text-2xl uppercase">Active listings</h2>
        <ul className="space-y-3">
          {listings.map((l) => {
            const isSeller = address?.toLowerCase() === l.seller;
            return (
              <li key={l.listingId} className="border-2 border-brand-black p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold">LISTING #{l.listingId}</span>
                    <span className="brutal-tag ml-2">PROJECT #{l.projectId}</span>
                  </div>
                  <div className="font-mono text-sm">
                    {formatEther(l.pricePerUnit)} ETH / tonne · {l.amount} available
                  </div>
                </div>
                <div className="font-mono text-xs">SELLER {l.seller}</div>
                {isSeller ? (
                  <button
                    className="brutal-btn mt-2"
                    disabled={busy === l.listingId}
                    onClick={() => cancel(l)}
                  >
                    {busy === l.listingId ? 'Cancelling…' : 'Cancel'}
                  </button>
                ) : (
                  <BuyForm onBuy={(q) => buy(l, q)} max={l.amount} busy={busy === l.listingId} />
                )}
              </li>
            );
          })}
          {listings.length === 0 && <li className="font-mono">No active listings.</li>}
        </ul>
      </div>
    </section>
  );
}

function BuyForm({
  onBuy,
  max,
  busy,
}: {
  onBuy: (qty: string) => void;
  max: string;
  busy: boolean;
}) {
  const [qty, setQty] = useState('1');
  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        className="brutal-input w-24"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        min={1}
        max={max}
      />
      <button className="brutal-btn-red" disabled={busy} onClick={() => onBuy(qty)}>
        {busy ? 'Buying…' : 'Buy'}
      </button>
    </div>
  );
}
