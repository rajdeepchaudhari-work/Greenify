import { useTx } from '../hooks/useTx';
import { CHAIN_ID } from '../lib/contracts';

const EXPLORER = CHAIN_ID === 11155111 ? 'https://sepolia.etherscan.io' : 'https://etherscan.io';

export default function TxBanner() {
  const { stage, label, hash, error, dismiss } = useTx();
  if (stage === 'idle') return null;

  const palette: Record<Exclude<typeof stage, 'idle'>, string> = {
    signing: 'bg-brand-yellow',
    mining: 'bg-brand-yellow',
    success: 'bg-green-300',
    error: 'bg-brand-red text-white',
  };

  const icon = stage === 'success' ? '✓' : stage === 'error' ? '!' : null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        className={`flex min-w-[320px] max-w-2xl items-center gap-3 border-2 border-brand-black p-3 shadow-brutal-sm ${palette[stage]}`}
      >
        {stage === 'signing' || stage === 'mining' ? (
          <Spinner />
        ) : (
          <span className="font-mono text-xl font-bold">{icon}</span>
        )}
        <div className="min-w-0 flex-1 font-mono text-sm">
          <div className="font-bold uppercase">
            {stage === 'signing' && `Waiting for wallet · ${label}`}
            {stage === 'mining' && `Mining · ${label}`}
            {stage === 'success' && `Confirmed · ${label}`}
            {stage === 'error' && `Failed · ${label}`}
          </div>
          {hash && (
            <a
              href={`${EXPLORER}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs"
            >
              {hash.slice(0, 14)}…{hash.slice(-10)} ↗
            </a>
          )}
          {error && <div className="mt-0.5 truncate text-xs opacity-90">{error}</div>}
        </div>
        <button
          onClick={dismiss}
          className="ml-2 border border-current px-2 py-0.5 font-mono text-xs uppercase"
        >
          close
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin border-2 border-brand-black border-t-transparent"
      aria-hidden
    />
  );
}
