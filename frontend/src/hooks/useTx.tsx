import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { createElement } from 'react';
import type { ContractTransactionResponse } from 'ethers';

export type TxStage = 'idle' | 'signing' | 'mining' | 'success' | 'error';

export interface TxState {
  stage: TxStage;
  label: string;
  hash: string | null;
  error: string | null;
}

interface TxContextValue extends TxState {
  run: (label: string, fn: () => Promise<ContractTransactionResponse>) => Promise<boolean>;
  dismiss: () => void;
}

const TxContext = createContext<TxContextValue | null>(null);

export function TxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TxState>({
    stage: 'idle',
    label: '',
    hash: null,
    error: null,
  });

  const dismiss = useCallback(() => {
    setState({ stage: 'idle', label: '', hash: null, error: null });
  }, []);

  const run = useCallback(async (label: string, fn: () => Promise<ContractTransactionResponse>) => {
    setState({ stage: 'signing', label, hash: null, error: null });
    try {
      const tx = await fn();
      setState({ stage: 'mining', label, hash: tx.hash, error: null });
      await tx.wait();
      setState({ stage: 'success', label, hash: tx.hash, error: null });
      setTimeout(() => {
        setState((s) =>
          s.stage === 'success' ? { stage: 'idle', label: '', hash: null, error: null } : s,
        );
      }, 4000);
      return true;
    } catch (e) {
      const msg =
        (e as { shortMessage?: string; message?: string }).shortMessage ?? (e as Error).message;
      setState({ stage: 'error', label, hash: null, error: msg });
      setTimeout(() => {
        setState((s) =>
          s.stage === 'error' ? { stage: 'idle', label: '', hash: null, error: null } : s,
        );
      }, 6000);
      return false;
    }
  }, []);

  return createElement(TxContext.Provider, { value: { ...state, run, dismiss } }, children);
}

export function useTx() {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error('useTx must be used inside <TxProvider>');
  return ctx;
}
