import { useEffect, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Marquee from '../components/Marquee';
import { fetchListings, fetchProjects } from '../lib/api';

export default function Landing() {
  const [stats, setStats] = useState({ projects: 0, approved: 0, listings: 0, issued: 0n });

  useEffect(() => {
    (async () => {
      try {
        const [projects, listings] = await Promise.all([fetchProjects(), fetchListings()]);
        const approved = projects.filter((p) => p.approved).length;
        const issued = projects.reduce((a, p) => a + BigInt(p.totalIssued || '0'), 0n);
        setStats({ projects: projects.length, approved, listings: listings.length, issued });
      } catch {
        /* backend offline is fine */
      }
    })();
  }, []);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b-[3px] border-ink bg-cream px-5 pb-16 pt-16 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.12]" />
        {/* rotated yellow sticker */}
        <div className="pointer-events-none absolute right-6 top-28 hidden rotate-6 border-[3px] border-ink bg-yellow px-3 py-1 font-mono text-[0.65rem] font-bold uppercase shadow-[4px_4px_0_#000] lg:block">
          Mint · Trade · Retire
        </div>
        {/* rotated green sticker */}
        <div className="pointer-events-none absolute -left-3 bottom-20 hidden -rotate-[8deg] animate-sticker-wiggle border-[3px] border-ink bg-green px-3 py-1 font-mono text-[0.65rem] font-bold uppercase shadow-[4px_4px_0_#000] lg:block">
          ▲ Public ledger by default
        </div>

        <div className="relative mx-auto max-w-6xl stagger-in">
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2 bg-ink px-3 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-cream">
            <span className="h-2 w-2 animate-pulse bg-green" />
            Live · Ethereum Sepolia · ERC-1155
          </div>

          <h1 className="text-editorial mb-8 max-w-5xl text-mega uppercase text-ink">
            Put a price on{' '}
            <span className="inline-block border-[3px] border-ink bg-red px-2 shadow-[6px_6px_0_#000]">
              carbon.
            </span>
            <br />
            On-chain.
          </h1>

          <p className="mb-10 max-w-2xl font-sans text-[1rem] font-medium leading-[1.65] md:text-[1.15rem]">
            Greenify turns verified environmental projects into <strong>ERC-1155 tokens</strong> you
            can trade and retire on Ethereum. Every mint, sale, and retirement is a public
            transaction — <strong>no middlemen</strong>, no missing spreadsheets,{' '}
            <strong>no double-counting</strong>.
          </p>

          <div className="mb-14 flex flex-col gap-4 sm:flex-row">
            <Link to="/app" className="brut-btn bg-ink px-7 py-4 text-[0.88rem] text-cream">
              Launch App →
            </Link>
            <a
              href="https://sepolia.etherscan.io/address/0x62eE925038f472E4E4a9D59B78E1e29A19112486#code"
              target="_blank"
              rel="noreferrer"
              className="brut-btn bg-yellow px-7 py-4 text-[0.88rem] text-ink"
            >
              Verified on Etherscan ↗
            </a>
            <a
              href="https://github.com/rajdeepchaudhari-work/Greenify"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-2 py-4 font-mono text-[0.82rem] font-bold uppercase tracking-[0.1em] underline underline-offset-[6px] hover:text-red"
            >
              Read the code ↗
            </a>
          </div>

          {/* Meta strip */}
          <div className="grid max-w-3xl grid-cols-2 border-[3px] border-ink bg-ink text-cream shadow-[6px_6px_0_#000] md:grid-cols-4">
            {[
              { label: 'Chain', value: 'Sepolia' },
              { label: 'Standard', value: 'ERC-1155' },
              { label: 'Contracts', value: '3 Verified' },
              { label: 'License', value: 'MIT · OSS' },
            ].map((m, i) => (
              <div
                key={m.label}
                className={`px-4 py-3 ${i < 3 ? 'border-r-[3px] border-ink md:border-r-[3px]' : ''} ${
                  i < 2 ? 'border-b-[3px] border-ink md:border-b-0' : ''
                }`}
              >
                <div className="mb-0.5 font-mono text-[0.6rem] font-bold uppercase text-yellow tracking-[0.15em]">
                  {m.label}
                </div>
                <div className="font-display text-[0.95rem] font-extrabold uppercase">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <Marquee />

      {/* ===================== PROBLEM ===================== */}
      <section
        id="problem"
        className="relative border-b-[3px] border-ink bg-cream px-5 py-24 lg:px-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-brut opacity-60" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-3 inline-block border-2 border-ink bg-red px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream">
            The problem
          </div>
          <h2 className="text-editorial mb-6 max-w-4xl text-giga uppercase">
            Carbon markets are a{' '}
            <span className="inline-block border-[3px] border-ink bg-ink px-2 text-cream">
              black box.
            </span>
          </h2>
          <p className="mb-14 max-w-2xl font-sans text-[1.05rem] font-medium leading-[1.65]">
            A 900-billion-dollar industry runs on PDFs, spreadsheets, and trust-us registries. That
            isn&apos;t accounting — <strong>it&apos;s theatre.</strong>
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <ProblemCard n="01" title="Double-counting" bg="bg-yellow">
              The same offset gets sold to two buyers by two different registries. Nobody catches it
              because nobody can see the full ledger.
            </ProblemCard>
            <ProblemCard n="02" title="Retirement fraud" bg="bg-red" invert>
              Credits &quot;retired&quot; by one firm quietly reappear on another firm&apos;s ESG
              report six months later.
            </ProblemCard>
            <ProblemCard n="03" title="Zero auditability" bg="bg-lavender">
              Want to verify a claim? Email a PDF. Wait three weeks. Pray the registry still exists.
            </ProblemCard>
          </div>
        </div>
      </section>

      {/* ===================== PROTOCOL ===================== */}
      <section
        id="protocol"
        className="relative border-b-[3px] border-ink bg-ink px-5 py-24 text-cream lg:px-10"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 18px, #FDF2E9 18px, #FDF2E9 19px)',
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-3 inline-block border-2 border-cream bg-green px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink">
            The solution
          </div>
          <h2 className="text-editorial mb-6 max-w-4xl text-giga uppercase">
            Three contracts.
            <br />
            <span className="inline-block border-[3px] border-cream bg-yellow px-2 text-ink">
              One flow.
            </span>{' '}
            Public by default.
          </h2>
          <p className="mb-14 max-w-2xl font-sans text-[1.05rem] font-medium leading-[1.65] text-cream/80">
            Everything a carbon credit does — issuance, transfer, retirement — lives on three
            audited smart contracts and nothing else. The ledger is the product.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <Step
              n="01"
              title="Register & verify"
              bg="bg-yellow"
              body="Project owners pin evidence + metadata to IPFS. A verifier role approves the project on-chain. Every project gets a permanent, immutable ID."
            />
            <Step
              n="02"
              title="Mint & trade"
              bg="bg-red"
              body="Approved projects mint ERC-1155 credits — 1 token = 1 tonne CO₂e. List them on the built-in marketplace. Buyers settle instantly in ETH."
            />
            <Step
              n="03"
              title="Retire & prove"
              bg="bg-green"
              body="Holders call retire() to burn credits permanently. The on-chain event is the receipt. Regulators, auditors, anyone can verify from a block explorer in 10 seconds."
            />
          </div>
        </div>
      </section>

      {/* ===================== WHY ===================== */}
      <section id="why" className="relative border-b-[3px] border-ink bg-cream px-5 py-24 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.08]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-block border-2 border-ink bg-blue px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream">
                What makes it different
              </div>
              <h2 className="text-editorial max-w-3xl text-giga uppercase">
                Proof, not{' '}
                <span className="inline-block border-[3px] border-ink bg-yellow px-2">
                  promises.
                </span>
              </h2>
            </div>
            <p className="max-w-sm border-l-[3px] border-ink pl-5 font-sans text-[0.95rem] font-medium leading-[1.55]">
              Five things you can verify from a block explorer — no brochure required.
            </p>
          </div>

          <div className="mt-14 grid gap-0 border-[3px] border-ink bg-ink shadow-[8px_8px_0_#000] md:grid-cols-2">
            {[
              {
                t: 'Public ledger, not a private database',
                b: 'Every project, listing, and retirement is on Ethereum. You don\u2019t trust us — you check.',
              },
              {
                t: 'One token = one tonne',
                b: 'ERC-1155 with project IDs baked in. Provenance is native to the token, not bolted on.',
              },
              {
                t: 'Burn-to-claim retirement',
                b: 'Offsets are gone from circulation the moment they\u2019re used. No recycling, no relisting.',
              },
              {
                t: 'Open source, end to end',
                b: 'Contracts, indexer, frontend, deployment scripts — all on GitHub, MIT-licensed.',
              },
              {
                t: 'No custody, no KYC',
                b: 'You hold your credits in your wallet. We never touch them.',
                span: true,
              },
            ].map((f, i) => (
              <div
                key={f.t}
                className={`border-b-[3px] border-cream/20 bg-cream p-7 last:border-b-0 md:border-b-[3px] ${
                  f.span ? 'md:col-span-2' : ''
                } ${i % 2 === 1 && !f.span ? 'md:border-l-[3px] md:border-cream/20' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-ink bg-yellow font-mono text-sm font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-extrabold uppercase leading-tight">
                      {f.t}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed">{f.b}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== LIVE STATS ===================== */}
      <section
        id="stats"
        className="relative overflow-hidden border-b-[3px] border-ink bg-yellow px-5 py-24 lg:px-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-stripes opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 border-2 border-ink bg-ink px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream">
                <span className="h-2 w-2 animate-pulse bg-green" />
                Live · Sepolia · Refreshed every 20s
              </div>
              <h2 className="text-editorial max-w-3xl text-giga uppercase">
                Numbers don&apos;t{' '}
                <span className="inline-block border-[3px] border-ink bg-ink px-2 text-cream">
                  negotiate.
                </span>
              </h2>
            </div>
            <Link to="/app" className="brut-btn bg-ink px-6 py-3 text-[0.78rem] text-cream">
              Browse the app →
            </Link>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <BigStat label="Projects" value={stats.projects.toString()} />
            <BigStat label="Approved" value={stats.approved.toString()} />
            <BigStat label="Active listings" value={stats.listings.toString()} />
            <BigStat label="tCO₂e issued" value={stats.issued.toString()} />
          </div>
        </div>
      </section>

      {/* ===================== TECH STACK ===================== */}
      <section className="relative border-b-[3px] border-ink bg-cream px-5 py-24 lg:px-10">
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-3 inline-block border-2 border-ink bg-lavender px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em]">
            Built with
          </div>
          <h2 className="text-editorial max-w-3xl text-giga uppercase">
            Open source,{' '}
            <span className="inline-block border-[3px] border-ink bg-green px-2">
              top to bottom.
            </span>
          </h2>
          <p className="mt-5 max-w-xl font-sans text-[0.95rem] font-medium leading-[1.6]">
            No proprietary black boxes. Every dependency is open-source, audited, and inspectable.
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <StackBlock
              heading="On-chain"
              accent="bg-red"
              items={[
                'Solidity 0.8.24',
                'OpenZeppelin',
                'Hardhat',
                'ethers.js v6',
                'ERC-1155',
                'Ethereum Sepolia',
              ]}
            />
            <StackBlock
              heading="Off-chain"
              accent="bg-blue"
              items={[
                'React + Vite',
                'TailwindCSS',
                'MetaMask',
                'Express',
                'MongoDB',
                'IPFS · Pinata',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="faq" className="relative border-b-[3px] border-ink bg-cream px-5 py-24 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-brut opacity-60" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-3 inline-block border-2 border-ink bg-green px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em]">
            FAQ
          </div>
          <h2 className="text-editorial mb-10 max-w-3xl text-giga uppercase">
            Questions worth answering.
          </h2>
          <div className="space-y-4">
            <Faq q="Is this production?">
              No. Greenify is live on Sepolia testnet as a CN6035 Task 1 deliverable. The same
              contracts would deploy to mainnet with zero changes — but real-world credit issuance
              needs an off-chain verification pipeline (MRV providers, registry partnerships) we
              haven&apos;t built yet.
            </Faq>
            <Faq q="How do you stop double-counting?">
              Every credit is an ERC-1155 token with a project ID. Once minted, it exists in exactly
              one wallet. Transferring moves it. Retiring burns it. There&apos;s no path to exist in
              two places at once.
            </Faq>
            <Faq q="Why ERC-1155 and not ERC-20 or ERC-721?">
              ERC-20 would make all credits fungible across projects — you&apos;d lose provenance.
              ERC-721 gives each credit a unique NFT — overkill, since credits are fungible within a
              project. ERC-1155 lets one contract hold many project batches, each fungible
              internally. It&apos;s the right shape.
            </Faq>
            <Faq q="Can I cheat the verifier?">
              A compromised verifier could approve a fraudulent project. We limit damage by making
              every approval a public event, letting the admin revoke the verifier role, and pinning
              all project metadata to IPFS where tampering is visible. A production deploy would use
              a multisig verifier role, not a single EOA.
            </Faq>
            <Faq q="Is my wallet key sent to your server?">
              No. Never. MetaMask signs transactions locally and only the signed hex goes to the RPC
              node. The backend only reads public blockchain events; it never sees your private key.
            </Faq>
            <Faq q="Can I use it without MetaMask?">
              You can browse the app — view projects, listings, stats — without a wallet. You
              can&apos;t transact without one. That&apos;s a blockchain constraint, not a product
              choice.
            </Faq>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative overflow-hidden bg-red px-5 py-24 text-ink lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-stripes opacity-[0.08]" />
        <div className="relative mx-auto max-w-6xl">
          <h2 className="text-editorial max-w-4xl text-mega uppercase">
            Mint.
            <br />
            <span className="inline-block border-[3px] border-ink bg-cream px-2">Trade.</span>{' '}
            Retire.
          </h2>
          <p className="mt-8 max-w-xl font-sans text-[1.05rem] font-medium leading-[1.6]">
            No sign-up. No KYC. No spreadsheets. Connect a wallet, claim Sepolia ETH, and trade a
            real on-chain credit in under five minutes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/app" className="brut-btn bg-ink px-8 py-5 text-[0.92rem] text-cream">
              Launch App →
            </Link>
            <a
              href="https://github.com/rajdeepchaudhari-work/Greenify"
              target="_blank"
              rel="noreferrer"
              className="brut-btn bg-cream px-8 py-5 text-[0.92rem] text-ink"
            >
              View Source ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ==================== COMPONENTS ==================== */

function ProblemCard({
  n,
  title,
  children,
  bg,
  invert,
}: {
  n: string;
  title: string;
  children: ReactNode;
  bg: string;
  invert?: boolean;
}) {
  return (
    <div
      className={`relative border-[3px] border-ink ${bg} p-7 shadow-[6px_6px_0_#000] transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[9px_9px_0_#000] ${
        invert ? 'text-cream' : 'text-ink'
      }`}
    >
      <div
        className={`mb-4 font-mono text-sm font-bold tracking-[0.12em] ${invert ? 'text-cream/80' : 'text-ink/70'}`}
      >
        — {n}
      </div>
      <h3 className="text-editorial text-2xl uppercase">{title}</h3>
      <p className="mt-3 font-sans text-sm font-medium leading-[1.55]">{children}</p>
    </div>
  );
}

function Step({ n, title, body, bg }: { n: string; title: string; body: string; bg: string }) {
  return (
    <div className="relative">
      <div className="absolute -top-4 -left-3 z-10 inline-flex h-10 w-10 items-center justify-center border-[3px] border-cream bg-ink font-display text-lg font-extrabold text-yellow">
        {n}
      </div>
      <div
        className={`relative border-[3px] border-cream ${bg} p-7 text-ink shadow-[6px_6px_0_#FDF2E9] transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[9px_9px_0_#FDF2E9]`}
      >
        <h3 className="text-editorial mt-2 text-2xl uppercase">{title}</h3>
        <p className="mt-4 font-sans text-sm font-medium leading-[1.6]">{body}</p>
      </div>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[3px] border-ink bg-cream p-6 shadow-[6px_6px_0_#000]">
      <div className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink/70">
        {label}
      </div>
      <div className="text-editorial mt-2 text-[clamp(2.5rem,6vw,4.5rem)] leading-none">
        {value}
      </div>
    </div>
  );
}

function StackBlock({
  heading,
  accent,
  items,
}: {
  heading: string;
  accent: string;
  items: string[];
}) {
  return (
    <div>
      <div
        className={`mb-4 inline-block border-2 border-ink ${accent} px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream`}
      >
        {heading}
      </div>
      <div className="grid grid-cols-2 gap-0 border-[3px] border-ink bg-ink shadow-[6px_6px_0_#000] sm:grid-cols-3">
        {items.map((t, i) => (
          <div
            key={t}
            className={`bg-cream p-4 font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em] hover:bg-yellow ${
              i % 3 !== 2 ? 'sm:border-r-[2px] sm:border-ink' : ''
            } ${i < items.length - (items.length % 3 || 3) ? 'border-b-[2px] border-ink' : ''}`}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group border-[3px] border-ink bg-cream shadow-[4px_4px_0_#000] open:shadow-[6px_6px_0_#000]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-extrabold uppercase">
        {q}
        <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-ink bg-yellow font-mono text-lg transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t-[3px] border-ink bg-white p-5 font-sans text-sm font-medium leading-[1.65]">
        {children}
      </div>
    </details>
  );
}
