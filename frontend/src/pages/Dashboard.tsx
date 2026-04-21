import { useEffect, useMemo, useState } from 'react';
import { Contract, formatEther } from 'ethers';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useTx } from '../hooks/useTx';
import { fetchListings, fetchProjects, ListingRecord, ProjectRecord } from '../lib/api';
import { addresses, creditAbi } from '../lib/contracts';
import ProjectMeta from '../components/ProjectMeta';
import CopyButton from '../components/CopyButton';

export default function Dashboard() {
  const { address, signer } = useWallet();
  const tx = useTx();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [balances, setBalances] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
    fetchListings().then(setListings).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadBalances() {
      if (!address || !signer) return setBalances({});
      const credit = new Contract(addresses.credit, creditAbi, signer);
      const out: Record<number, string> = {};
      await Promise.all(
        projects.map(async (p) => {
          const bal = (await credit.balanceOf(address, p.projectId)) as bigint;
          if (bal > 0n) out[p.projectId] = bal.toString();
        }),
      );
      setBalances(out);
    }
    loadBalances();
  }, [address, signer, projects]);

  const stats = useMemo(() => {
    const totalIssued = projects.reduce((acc, p) => acc + BigInt(p.totalIssued || '0'), 0n);
    const approved = projects.filter((p) => p.approved).length;
    return {
      projects: projects.length,
      approved,
      activeListings: listings.length,
      totalIssued: totalIssued.toString(),
    };
  }, [projects, listings]);

  async function retire(projectId: number, amount: string) {
    if (!signer) return;
    setBusy(projectId);
    try {
      const credit = new Contract(addresses.credit, creditAbi, signer);
      const ok = await tx.run(`Retire ${amount} from #${projectId}`, () =>
        credit.retire(projectId, amount),
      );
      if (ok) {
        setBalances((b) => {
          const { [projectId]: _drop, ...rest } = b;
          return rest;
        });
      }
    } finally {
      setBusy(null);
    }
  }

  const owned = projects.filter((p) => balances[p.projectId]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold uppercase">Dashboard</h1>
        <p className="mt-2 max-w-2xl font-mono text-sm">
          On-chain carbon credit trading on Sepolia. Browse projects and listings below — no wallet
          needed. Connect one to register, mint, trade, or retire credits.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projects" value={stats.projects.toString()} />
        <Stat label="Approved" value={stats.approved.toString()} />
        <Stat label="Active listings" value={stats.activeListings.toString()} />
        <Stat label="Credits issued" value={stats.totalIssued} suffix="tCO₂e" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="brutal-card p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl uppercase">Latest projects</h2>
            <Link to="/registry" className="font-mono text-sm">
              view all →
            </Link>
          </div>
          <ul className="divide-y-2 divide-brand-black">
            {projects.slice(0, 5).map((p) => (
              <li key={p.projectId} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center font-mono font-bold">
                    #{p.projectId}
                    <CopyButton value={String(p.projectId)} label="project id" />
                  </span>
                  <span className={p.approved ? 'brutal-tag bg-brand-red' : 'brutal-tag'}>
                    {p.approved ? 'APPROVED' : 'PENDING'}
                  </span>
                </div>
                <ProjectMeta cid={p.ipfsCid} />
              </li>
            ))}
            {projects.length === 0 && <li className="py-2 font-mono text-sm">No projects yet.</li>}
          </ul>
        </div>

        <div className="brutal-card p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl uppercase">Open listings</h2>
            <Link to="/market" className="font-mono text-sm">
              view market →
            </Link>
          </div>
          <ul className="divide-y-2 divide-brand-black">
            {listings.slice(0, 5).map((l) => (
              <li key={l.listingId} className="flex items-center justify-between py-2">
                <div className="font-mono">
                  #{l.listingId} · PROJECT #{l.projectId}
                </div>
                <div className="font-mono text-sm">
                  {formatEther(l.pricePerUnit)} ETH · {l.amount} left
                </div>
              </li>
            ))}
            {listings.length === 0 && (
              <li className="py-2 font-mono text-sm">No active listings.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="brutal-card p-6">
        <h2 className="mb-3 text-2xl uppercase">Your credits</h2>
        {!address && (
          <p className="font-mono text-sm">
            Connect your wallet to see credits you own and retire them.
          </p>
        )}
        {address && owned.length === 0 && (
          <p className="font-mono text-sm">No credits held on this address.</p>
        )}
        {owned.length > 0 && (
          <ul className="divide-y-2 divide-brand-black">
            {owned.map((p) => (
              <li key={p.projectId} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center font-mono font-bold">
                      PROJECT #{p.projectId}
                      <CopyButton value={String(p.projectId)} label="project id" />
                    </div>
                    <ProjectMeta cid={p.ipfsCid} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="brutal-tag">{balances[p.projectId]} tCO₂e</span>
                    <button
                      className="brutal-btn-red"
                      disabled={busy === p.projectId}
                      onClick={() => retire(p.projectId, balances[p.projectId])}
                    >
                      {busy === p.projectId ? 'Retiring…' : 'Retire all'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="brutal-card p-4">
      <div className="font-mono text-xs uppercase text-brand-black/70">{label}</div>
      <div className="mt-1 font-mono text-3xl font-bold">
        {value}
        {suffix && <span className="ml-1 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
