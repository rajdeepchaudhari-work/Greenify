export default function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[2fr_1fr_1fr] lg:px-10">
        <div>
          <div className="font-display text-4xl font-extrabold uppercase leading-none tracking-tight">
            <span className="text-red">G</span>REENIFY
          </div>
          <p className="mt-3 max-w-sm font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-cream/70">
            Carbon credit protocol. Live on Ethereum Sepolia.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 border-2 border-cream/40 bg-ink px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream">
            <span className="h-2 w-2 animate-pulse bg-green" />
            Live on Sepolia
          </div>
        </div>

        <div>
          <div className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-yellow">
            On-chain
          </div>
          <ul className="mt-3 space-y-2 font-mono text-xs">
            <li>
              <a
                href="https://sepolia.etherscan.io/address/0xCC99Ef02ee49bA27AE102B087219892F9eD812e8#code"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow"
              >
                Registry ↗
              </a>
            </li>
            <li>
              <a
                href="https://sepolia.etherscan.io/address/0x02eeBE9DcCC6499a2eaA4C344A1773C3F7606c5B#code"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow"
              >
                CarbonCredit ↗
              </a>
            </li>
            <li>
              <a
                href="https://sepolia.etherscan.io/address/0x62eE925038f472E4E4a9D59B78E1e29A19112486#code"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow"
              >
                Marketplace ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-yellow">
            Project
          </div>
          <ul className="mt-3 space-y-2 font-mono text-xs">
            <li>
              <a
                href="https://github.com/rajdeepchaudhari-work/Greenify"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow"
              >
                GitHub ↗
              </a>
            </li>
            <li>
              <a href="/app" className="hover:text-yellow">
                Launch App →
              </a>
            </li>
            <li>
              <a
                href="https://rajdeepchaudhari.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow"
              >
                rajdeepchaudhari.com ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t-2 border-cream/20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-cream/60 sm:flex-row sm:items-center lg:px-10">
          <span>© 2026 Greenify · MIT license</span>
          <span>
            Built by{' '}
            <a
              href="https://rajdeepchaudhari.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-yellow hover:underline"
            >
              Rajdeep Chaudhari
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
