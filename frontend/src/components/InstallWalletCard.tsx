const WALLETS = [
  { name: 'MetaMask', url: 'https://metamask.io/download/', tag: 'Most popular' },
  { name: 'Rabby', url: 'https://rabby.io/', tag: 'Power users' },
  {
    name: 'Coinbase Wallet',
    url: 'https://www.coinbase.com/wallet/downloads',
    tag: 'Beginner-friendly',
  },
];

export default function InstallWalletCard({ action }: { action?: string }) {
  return (
    <div className="border-[3px] border-ink bg-cream p-5 shadow-[4px_4px_0_#000]">
      <div className="mb-2 inline-flex items-center gap-2 border-2 border-ink bg-yellow px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.15em]">
        Wallet required
      </div>
      <h3 className="font-display text-xl font-extrabold uppercase leading-tight">
        Install a wallet to {action ?? 'continue'}
      </h3>
      <p className="mt-2 font-sans text-sm font-medium">
        A browser wallet signs on-chain actions. You stay in control of your keys — we never touch
        them. Pick any of these:
      </p>
      <ul className="mt-4 space-y-2">
        {WALLETS.map((w) => (
          <li key={w.name}>
            <a
              href={w.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border-2 border-ink bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.05em] hover:bg-yellow"
            >
              <span>{w.name}</span>
              <span className="flex items-center gap-2 text-[0.6rem] opacity-70">
                {w.tag} <span aria-hidden>↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.12em] opacity-70">
        After installing → refresh this page → click Connect Wallet.
      </p>
    </div>
  );
}
