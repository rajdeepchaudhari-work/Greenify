import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { CHAIN_ID } from '../lib/contracts';

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function NavBar() {
  const { address, chainId, connect, switchToTarget, hasWallet } = useWallet();
  const wrongNet = address && chainId !== CHAIN_ID;
  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] border-2 ${
      isActive
        ? 'border-ink bg-ink text-cream'
        : 'border-transparent hover:border-ink hover:bg-yellow'
    }`;

  const mobileLinkCls = ({ isActive }: { isActive: boolean }) =>
    `block border-2 px-4 py-2 font-display text-xl font-extrabold uppercase ${
      isActive
        ? 'border-ink bg-ink text-cream'
        : 'border-transparent hover:border-ink hover:bg-yellow'
    }`;

  function WalletSlot({ mobile = false }: { mobile?: boolean }) {
    const cls = mobile
      ? 'w-full justify-center brut-btn px-4 py-3 text-[0.8rem]'
      : 'brut-btn px-3 py-1.5 text-[0.72rem]';
    if (address) {
      return wrongNet ? (
        <button onClick={switchToTarget} className={`${cls} bg-red text-cream`}>
          Switch to Sepolia
        </button>
      ) : (
        <span className="brut-tag bg-ink">{short(address)}</span>
      );
    }
    if (hasWallet) {
      return (
        <button onClick={connect} className={`${cls} bg-yellow text-ink`}>
          Connect Wallet
        </button>
      );
    }
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        title="No wallet detected — install MetaMask"
        className={`${cls} bg-red text-cream`}
      >
        Install Wallet ↗
      </a>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-10">
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

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
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
          <WalletSlot />
        </nav>

        {/* mobile burger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="border-2 border-ink bg-yellow p-2 md:hidden"
        >
          <div className="space-y-1">
            <span
              className={`block h-[2px] w-5 bg-ink transition-all ${
                open ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-ink transition-all ${open ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-[2px] w-5 bg-ink transition-all ${
                open ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="border-t-[3px] border-ink bg-cream px-5 pb-5 pt-3 md:hidden">
          <nav className="space-y-2">
            <NavLink to="/app" end onClick={() => setOpen(false)} className={mobileLinkCls}>
              Dashboard
            </NavLink>
            <NavLink to="/app/registry" onClick={() => setOpen(false)} className={mobileLinkCls}>
              Registry
            </NavLink>
            <NavLink to="/app/market" onClick={() => setOpen(false)} className={mobileLinkCls}>
              Market
            </NavLink>
          </nav>
          <div className="mt-4">
            <WalletSlot mobile />
          </div>
        </div>
      )}
    </header>
  );
}
