import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { fetchProjects, pinProjectMetadata, ProjectRecord } from '../lib/api';
import { addresses, registryAbi, creditAbi } from '../lib/contracts';

export default function Registry() {
  const { address, signer } = useWallet();
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
      setStatus(`Submitting on-chain (CID ${cid})…`);
      const registry = new Contract(addresses.registry, registryAbi, signer);
      const tx = await registry.registerProject(cid);
      await tx.wait();
      setStatus('Registered.');
      setName('');
      setDescription('');
      setLocation('');
      setImage(null);
      setTimeout(reload, 1500);
    } catch (e) {
      setStatus('Error: ' + (e as Error).message);
    }
  }

  async function approve(id: number) {
    if (!signer) return;
    const registry = new Contract(addresses.registry, registryAbi, signer);
    const tx = await registry.approveProject(id);
    await tx.wait();
    reload();
  }

  async function mint(id: number) {
    if (!signer) return;
    const credit = new Contract(addresses.credit, creditAbi, signer);
    const tx = await credit.mint(mintTo[id] ?? address, id, mintAmt[id] ?? '0');
    await tx.wait();
    reload();
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="brutal-card p-6">
        <h2 className="mb-4 text-3xl uppercase">Register project</h2>
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
      </div>

      <div className="brutal-card p-6">
        <h2 className="mb-4 text-3xl uppercase">Projects</h2>
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.projectId} className="border-2 border-brand-black bg-brand-cream p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold">#{p.projectId}</span>
                <span className={p.approved ? 'brutal-tag bg-brand-red' : 'brutal-tag'}>
                  {p.approved ? 'APPROVED' : 'PENDING'}
                </span>
              </div>
              <div className="font-mono text-xs">CID {p.ipfsCid}</div>
              <div className="font-mono text-xs">OWNER {p.owner}</div>
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
