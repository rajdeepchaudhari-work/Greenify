import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useTx } from '../hooks/useTx';
import { fetchProjects, pinProjectMetadata, ProjectRecord } from '../lib/api';
import { addresses, registryAbi, creditAbi } from '../lib/contracts';
import ConnectGate from '../components/ConnectGate';
import ProjectMeta from '../components/ProjectMeta';
import CopyButton from '../components/CopyButton';

export default function Registry() {
  const { address, signer } = useWallet();
  const tx = useTx();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isVerifier, setIsVerifier] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [mintTo, setMintTo] = useState<Record<number, string>>({});
  const [mintAmt, setMintAmt] = useState<Record<number, string>>({});

  async function reload() {
    const p = await fetchProjects();
    setProjects(p);
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    async function checkRole() {
      if (!address || !signer) return setIsVerifier(false);
      const registry = new Contract(addresses.registry, registryAbi, signer);
      const role = (await registry.VERIFIER_ROLE()) as string;
      setIsVerifier(await registry.hasRole(role, address));
    }
    checkRole();
  }, [address, signer]);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!signer || !address) return;
    try {
      setStatus('Pinning metadata to IPFS…');
      const { cid } = await pinProjectMetadata(
        { name, description, location, owner: address },
        image ?? undefined,
      );
      setStatus('');
      const registry = new Contract(addresses.registry, registryAbi, signer);
      const ok = await tx.run('Register project', () => registry.registerProject(cid));
      if (ok) {
        setName('');
        setDescription('');
        setLocation('');
        setImage(null);
        setTimeout(reload, 1500);
      }
    } catch (e) {
      setStatus('Error: ' + (e as Error).message);
    }
  }

  async function approve(id: number) {
    if (!signer) return;
    const registry = new Contract(addresses.registry, registryAbi, signer);
    const ok = await tx.run(`Approve project #${id}`, () => registry.approveProject(id));
    if (ok) setTimeout(reload, 1500);
  }

  async function mint(id: number) {
    if (!signer) return;
    const credit = new Contract(addresses.credit, creditAbi, signer);
    const ok = await tx.run(`Mint credits for #${id}`, () =>
      credit.mint(mintTo[id] ?? address, id, mintAmt[id] ?? '0'),
    );
    if (ok) setTimeout(reload, 1500);
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="brutal-card p-6">
        <h2 className="mb-4 text-3xl uppercase">Register project</h2>
        <ConnectGate action="register a project">
          <form className="space-y-3" onSubmit={register}>
            <input
              className="brutal-input"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className="brutal-input"
              rows={4}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              className="brutal-input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="brutal-input"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <button className="brutal-btn" type="submit" disabled={!address}>
              Register
            </button>
            {status && <p className="font-mono text-sm">{status}</p>}
          </form>
        </ConnectGate>
      </div>

      <div className="brutal-card p-6">
        <h2 className="mb-4 text-3xl uppercase">Projects</h2>
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.projectId} className="border-2 border-brand-black bg-brand-cream p-3">
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
              <div className="mt-2 flex items-center font-mono text-xs text-brand-black/60">
                CID {p.ipfsCid.slice(0, 16)}…
                <CopyButton value={p.ipfsCid} label="CID" />
              </div>
              <div className="flex items-center font-mono text-xs text-brand-black/60">
                OWNER {p.owner.slice(0, 10)}…{p.owner.slice(-6)}
                <CopyButton value={p.owner} label="owner address" />
              </div>
              {isVerifier && !p.approved && (
                <button className="brutal-btn mt-2" onClick={() => approve(p.projectId)}>
                  Approve
                </button>
              )}
              {isVerifier && p.approved && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="brutal-input"
                    placeholder="recipient 0x…"
                    value={mintTo[p.projectId] ?? ''}
                    onChange={(e) => setMintTo((s) => ({ ...s, [p.projectId]: e.target.value }))}
                  />
                  <input
                    className="brutal-input"
                    placeholder="amount"
                    value={mintAmt[p.projectId] ?? ''}
                    onChange={(e) => setMintAmt((s) => ({ ...s, [p.projectId]: e.target.value }))}
                  />
                  <button className="brutal-btn-red" onClick={() => mint(p.projectId)}>
                    Mint
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
