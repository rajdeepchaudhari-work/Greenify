import { useEffect, useState } from 'react';
import { fetchMetadata, ipfsUrl, ProjectMetadata } from '../lib/ipfs';

export default function ProjectMeta({ cid }: { cid: string }) {
  const [meta, setMeta] = useState<ProjectMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMetadata(cid).then((m) => {
      if (mounted) {
        setMeta(m);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [cid]);

  if (loading) {
    return (
      <p className="mt-2 font-mono text-xs text-brand-black/60">Loading metadata from IPFS…</p>
    );
  }
  if (!meta) {
    return (
      <p className="mt-2 font-mono text-xs text-brand-black/60">
        Metadata unavailable (gateway timed out).
      </p>
    );
  }

  return (
    <div className="mt-2 flex gap-3">
      {meta.image && (
        <img
          src={ipfsUrl(meta.image)}
          alt={meta.name ?? 'project'}
          className="h-20 w-20 border-2 border-brand-black object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        {meta.name && <div className="font-mono font-bold uppercase">{meta.name}</div>}
        {meta.location && (
          <div className="font-mono text-xs text-brand-black/70">📍 {meta.location}</div>
        )}
        {meta.description && (
          <p className="mt-1 line-clamp-3 font-sans text-sm">{meta.description}</p>
        )}
      </div>
    </div>
  );
}
