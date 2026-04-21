import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { CHAIN_ID } from '../lib/contracts';

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function NavBar() {
  const { address, chainId, connect, switchToTarget } = useWallet();
  const wrongNet = address && chainId !== CHAIN_ID;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 font-mono uppercase text-sm ${
      isActive ? 'bg-brand-black text-brand-cream' : 'hover:bg-brand-yellow'
    }`;

  return (
    <header className="border-b-4 border-brand-black bg-brand-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="no-underline">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold">
              <span className="text-brand-red">G</span>REENIFY
            </span>
            <span className="brutal-tag">CARBON v0.1</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkCls} end>
            Dashboard
          </NavLink>
          <NavLink to="/registry" className={linkCls}>
            Registry
          </NavLink>
          <NavLink to="/market" className={linkCls}>
            Market
          </NavLink>
          {address ? (
            wrongNet ? (
              <button className="brutal-btn-red" onClick={switchToTarget}>
                Switch to Sepolia
              </button>
            ) : (
              <span className="brutal-tag">{short(address)}</span>
            )
          ) : (
            <button className="brutal-btn" onClick={connect}>
              Connect Wallet
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
