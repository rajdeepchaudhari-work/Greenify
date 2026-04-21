import { useState } from 'react';

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label ?? 'value'}`}
      aria-label={copied ? `${label ?? 'Value'} copied` : `Copy ${label ?? 'value'}`}
      aria-live="polite"
      className="ml-1 inline-flex h-5 w-5 items-center justify-center border border-brand-black bg-brand-cream font-mono text-[10px] leading-none focus:outline focus:outline-2 focus:outline-brand-black hover:bg-brand-yellow"
    >
      <span aria-hidden="true">{copied ? '✓' : '⎘'}</span>
    </button>
  );
}
