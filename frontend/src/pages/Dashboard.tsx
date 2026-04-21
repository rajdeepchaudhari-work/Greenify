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
    <section className="space-y-8">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 border-2 border-ink bg-ink px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream">
          <span className="h-2 w-2 animate-pulse bg-green" />
          Live · Sepolia
        </div>
        <h1 className="text-editorial text-giga uppercase">Dashboard</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm font-medium">
          On-chain carbon credit trading on Sepolia. Browse projects and listings below — no wallet
          needed. Connect one to register, mint, trade, or retire credits.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projects" value={stats.projects.toString()} bg="bg-yellow" />
        <Stat label="Approved" value={stats.approved.toString()} bg="bg-green" />
        <Stat label="Active listings" value={stats.activeListings.toString()} bg="bg-red" invert />
        <Stat label="Credits issued" value={stats.totalIssued} suffix="tCO₂e" bg="bg-lavender" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="brutal-card p-0">
          <div className="flex items-center justify-between border-b-[3px] border-ink bg-yellow px-5 py-3">
            <h2 className="text-editorial text-2xl uppercase">Latest projects</h2>
            <Link
              to="/app/registry"
              className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.1em] hover:underline"
            >
              view all →
            </Link>
          </div>
          <div className="p-5">
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
              {projects.length === 0 && (
                <li className="py-2 font-mono text-sm">No projects yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="brutal-card p-0">
          <div className="flex items-center justify-between border-b-[3px] border-ink bg-blue px-5 py-3 text-cream">
            <h2 className="text-editorial text-2xl uppercase">Open listings</h2>
            <Link
              to="/app/market"
              className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.1em] hover:underline"
            >
              view market →
            </Link>
          </div>
          <div className="p-5">
            <ul className="divide-y-2 divide-ink/20">
              {listings.slice(0, 5).map((l) => (
                <li key={l.listingId} className="flex items-center justify-between py-2">
                  <div className="font-mono text-sm">
                    <span className="font-bold">#{l.listingId}</span> · PROJECT #{l.projectId}
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
      </div>

      <div className="brutal-card p-0">
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-green px-5 py-3">
          <h2 className="text-editorial text-2xl uppercase">Your credits</h2>
          <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em]">
            Retire · Burn · Prove
          </span>
        </div>
        <div className="p-6">
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
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  suffix,
  bg = 'bg-white',
  invert,
}: {
  label: string;
  value: string;
  suffix?: string;
  bg?: string;
  invert?: boolean;
}) {
  return (
    <div
      className={`border-[3px] border-ink ${bg} p-5 shadow-[6px_6px_0_#000] transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[9px_9px_0_#000] ${
        invert ? 'text-cream' : 'text-ink'
      }`}
    >
      <div
        className={`font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] ${
          invert ? 'text-cream/80' : 'text-ink/70'
        }`}
      >
        {label}
      </div>
      <div className="text-editorial mt-2 text-[clamp(2rem,4.5vw,3rem)] leading-none">
        {value}
        {suffix && <span className="ml-1 text-sm font-medium">{suffix}</span>}
      </div>
    </div>
  );
}
