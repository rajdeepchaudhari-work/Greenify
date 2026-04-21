import { useEffect, useState, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { CHAIN_ID } from '../lib/contracts';

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
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      if (!window.ethereum) throw new Error('MetaMask not detected');
      const p = new BrowserProvider(window.ethereum as never);
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      const net = await p.getNetwork();
      const s = await p.getSigner();
      setProvider(p);
      setSigner(s);
      setAddress(accounts[0] ?? null);
      setChainId(Number(net.chainId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const switchToTarget = useCallback(async () => {
    if (!window.ethereum) return;
    const hex = '0x' + CHAIN_ID.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hex }],
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accounts: unknown) => {
      const a = accounts as string[];
      setAddress(a[0] ?? null);
    };
    const onChain = () => window.location.reload();
    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);
    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccounts);
      window.ethereum?.removeListener('chainChanged', onChain);
    };
  }, []);

  return { address, chainId, provider, signer, connect, switchToTarget, error };
}
