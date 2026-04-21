import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { CHAIN_ID } from '../lib/contracts';

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function NavBar() {
  const { address, chainId, connect, switchToTarget, hasWallet } = useWallet();
  const wrongNet = address && chainId !== CHAIN_ID;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] border-2 ${
      isActive
        ? 'border-ink bg-ink text-cream'
        : 'border-transparent hover:border-ink hover:bg-yellow'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 lg:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-[1.2rem] font-extrabold uppercase tracking-tight"
          aria-label="Greenify home"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center border-2 border-ink bg-red font-display text-[0.85rem] font-extrabold text-cream">
            G
          </span>
          Greenify
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/app" end className={linkCls}>
            Dashboard
          </NavLink>
          <NavLink to="/app/registry" className={linkCls}>
            Registry
          </NavLink>
          <NavLink to="/app/market" className={linkCls}>
            Market
          </NavLink>
          <span className="mx-2 h-6 w-px bg-ink/20" />
          {address ? (
            wrongNet ? (
              <button
                onClick={switchToTarget}
                className="brut-btn bg-red px-3 py-1.5 text-[0.72rem] text-cream"
              >
                Switch to Sepolia
              </button>
            ) : (
              <span className="brut-tag bg-ink">{short(address)}</span>
            )
          ) : hasWallet ? (
            <button
              onClick={connect}
              className="brut-btn bg-yellow px-3 py-1.5 text-[0.72rem] text-ink"
            >
              Connect Wallet
            </button>
          ) : (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              title="No wallet detected — install MetaMask"
              className="brut-btn bg-red px-3 py-1.5 text-[0.72rem] text-cream"
            >
              Install Wallet ↗
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
