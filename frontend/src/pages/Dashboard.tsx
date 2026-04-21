import { useEffect, useState } from 'react';
import { Contract, formatUnits } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { fetchProjects, ProjectRecord } from '../lib/api';
import { addresses, creditAbi } from '../lib/contracts';

export default function Dashboard() {
  const { address, signer } = useWallet();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [balances, setBalances] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadBalances() {
      if (!address || !signer) return;
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

  async function retire(projectId: number, amount: string) {
    if (!signer) return;
    try {
      setBusy(projectId);
      const credit = new Contract(addresses.credit, creditAbi, signer);
      const tx = await credit.retire(projectId, amount);
      await tx.wait();
      setBalances((b) => ({ ...b, [projectId]: '0' }));
    } finally {
      setBusy(null);
    }
  }

  const owned = projects.filter((p) => balances[p.projectId]);

  return (
    <section className="space-y-6">
      <h1 className="text-5xl font-bold uppercase">Dashboard</h1>

      <div className="brutal-card p-6">
        <h2 className="mb-2 text-2xl uppercase">Your credits</h2>
        {!address && <p className="font-mono">Connect wallet to view balances.</p>}
        {address && owned.length === 0 && <p className="font-mono">No credits held.</p>}
        <ul className="divide-y-2 divide-brand-black">
          {owned.map((p) => (
            <li key={p.projectId} className="flex items-center justify-between py-3">
              <div>
                <div className="font-mono font-bold">PROJECT #{p.projectId}</div>
                <div className="text-sm">CID: {p.ipfsCid}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="brutal-tag">
                  {formatUnits(balances[p.projectId] ?? '0', 0)} tCO₂e
                </span>
                <button
                  className="brutal-btn-red"
                  disabled={busy === p.projectId}
                  onClick={() => retire(p.projectId, balances[p.projectId])}
                >
                  {busy === p.projectId ? 'Retiring…' : 'Retire all'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
