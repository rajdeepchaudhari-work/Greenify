export interface ProjectMetadata {
  name?: string;
  description?: string;
  location?: string;
  methodology?: string;
  owner?: string;
  image?: string;
}

const cache = new Map<string, Promise<ProjectMetadata | null>>();

const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
];

export function fetchMetadata(cid: string): Promise<ProjectMetadata | null> {
  if (!cid) return Promise.resolve(null);
  if (cache.has(cid)) return cache.get(cid)!;

  const promise = (async () => {
    for (const gw of GATEWAYS) {
      try {
        const res = await fetch(`${gw}/${cid}`);
        if (res.ok) return (await res.json()) as ProjectMetadata;
      } catch {
        // try next gateway
      }
    }
    return null;
  })();

  cache.set(cid, promise);
  return promise;
}

export function ipfsUrl(cidOrUrl: string | undefined): string | undefined {
  if (!cidOrUrl) return undefined;
  if (cidOrUrl.startsWith('http')) return cidOrUrl;
  if (cidOrUrl.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${cidOrUrl.slice(7)}`;
  return `https://ipfs.io/ipfs/${cidOrUrl}`;
}
