import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createElement } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { CHAIN_ID } from '../lib/contracts';

/**
 * Wallet context, wraps MetaMask (EIP-1193) via ethers v6 BrowserProvider.
 *
 * Exposes:
 *  - connected address + chainId
 *  - a ready-to-use signer for contract writes
 *  - `connect()` to open the MetaMask popup
 *  - `switchToTarget()` to prompt a network switch to CHAIN_ID
 *  - `hasWallet` boolean so the UI can render an Install Wallet CTA when
 *    no `window.ethereum` is injected (e.g. mobile Safari, private browse)
 *
 * The context is read-through: every component gets the same state,
 * so wallet changes in one place (navbar Connect) propagate everywhere
 * (app pages, write actions).
 */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  switchToTarget: () => Promise<void>;
  error: string | null;
  hasWallet: boolean;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const p = new BrowserProvider(window.ethereum as never);
      const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[];
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
        return;
      }
      const net = await p.getNetwork();
      const s = await p.getSigner();
      setProvider(p);
      setSigner(s);
      setAddress(accounts[0]);
      setChainId(Number(net.chainId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      if (!window.ethereum) throw new Error('MetaMask not detected');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [refresh]);

  const switchToTarget = useCallback(async () => {
    if (!window.ethereum) return;
    const hex = '0x' + CHAIN_ID.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hex }],
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    if (!window.ethereum) return;
    const onAccounts = () => refresh();
    const onChain = () => refresh();
    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);
    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccounts);
      window.ethereum?.removeListener('chainChanged', onChain);
    };
  }, [refresh]);

  const hasWallet = typeof window !== 'undefined' && !!window.ethereum;
  const value: WalletState = {
    address,
    chainId,
    provider,
    signer,
    connect,
    switchToTarget,
    error,
    hasWallet,
  };
  return createElement(WalletContext.Provider, { value }, children);
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
