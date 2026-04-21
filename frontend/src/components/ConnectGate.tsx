import { ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';
import { CHAIN_ID } from '../lib/contracts';
import InstallWalletCard from './InstallWalletCard';

interface Props {
  children: ReactNode;
  /** Short label for the gated action, e.g. "register a project". */
  action?: string;
}

export default function ConnectGate({ children, action }: Props) {
  const { address, chainId, connect, switchToTarget, hasWallet } = useWallet();

  if (!hasWallet) {
    return <InstallWalletCard action={action} />;
  }

  if (!address) {
    return (
      <div className="border-2 border-dashed border-brand-black bg-brand-cream p-4">
        <p className="mb-3 font-mono text-sm">
          {action ? `Connect a wallet to ${action}.` : 'Connect a wallet to continue.'} Browsing
          does not require a wallet.
        </p>
        <button className="brutal-btn" onClick={connect}>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (chainId !== CHAIN_ID) {
    return (
      <div className="border-2 border-dashed border-brand-black bg-brand-cream p-4">
        <p className="mb-3 font-mono text-sm">
          Wrong network detected. Switch to Sepolia (chain id {CHAIN_ID}).
        </p>
        <button className="brutal-btn-red" onClick={switchToTarget}>
          Switch to Sepolia
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
