# Greenify — Technical Report

**Module:** CN6035 Mobile and Distributed Systems — Task 1 (Hybrid DApp, 70%)
**Author:** Rajdeep Chaudhari — Student ID 2522821
**Repository:** <https://github.com/rajdeepchaudhari-work/Greenify>
**Live deployment:** <https://greenifyrc.vercel.app>
**Word count:** ~1,750

---

## 1. Why I built this

The voluntary carbon market moved roughly $900bn last year. Most of it still runs on PDFs, spreadsheets, and proprietary registries you have to email to audit. In 2023 a Guardian investigation of Verra — the biggest certifier — found the majority of its rainforest credits did not represent real emission reductions. That isn't a Verra problem. It's a ledger problem. When the record is private, double-counting, silent re-use and retirement fraud are invisible to the people paying for the offsets.

Greenify moves that record onto Ethereum. Three small contracts. Every registration, mint, sale, and retirement is a public transaction. Anyone can audit the lifecycle of any credit from a block explorer. The hybrid DApp on top is a nicer way to interact, but the ledger is the thing that matters.

This report walks through what I built, why I made the calls I did, and where I'd take it next if I had more time.

## 2. System overview

```
React 18 + Vite SPA  ─►  Vercel serverless /api/*  ─►  MongoDB Atlas
      │                          │                        │
      │ ethers v6                │ ethers v6              │ cached events
      ▼                          ▼                        ▲
   MetaMask ──── signed tx ──►  Ethereum Sepolia ─── logs ┘
                                ┌────────────────────────┐
                                │ ProjectRegistry        │
                                │ CarbonCredit (ERC-1155)│
                                │ Marketplace            │
                                └────────────────────────┘
```

Three tiers. Contracts own state. The serverless API caches events and pins metadata. The SPA presents the ledger and talks to the wallet. I kept the boundary between on-chain and off-chain deliberately strict: Mongo is a read-only mirror and can be wiped and rebuilt from Sepolia at any time. No off-chain service is ever the source of truth.

## 3. Smart contracts

### 3.1 ProjectRegistry

The registry is the list of environmental projects. `registerProject(string ipfsCid)` is permissionless — anyone can submit a project and pin its metadata on IPFS. What it cannot do on its own is issue credits. That gate is `VERIFIER_ROLE` from OpenZeppelin's `AccessControl`. For the coursework deployment the verifier is a single test account; in production it would be a Gnosis Safe multisig. I picked role-based access over plain `Ownable` precisely so that swap is a configuration change rather than a contract rewrite.

One small thing I care about: the project id is the same number as the ERC-1155 `tokenId` of the credit. There is no mapping to keep in sync between the registry and the token. You register a project, you get an id, credits minted against that id are that project — end of story.

### 3.2 CarbonCredit (ERC-1155)

Credits are ERC-1155 tokens. One unit of any `tokenId` equals one tonne of CO₂ equivalent. I thought about the alternatives before landing here:

- **ERC-20** — turns every credit into one fungible pool. You lose the ability to say "I retired credits from _this_ forestry project in Brazil." That's a deal-breaker for carbon accounting.
- **ERC-721** — every credit is a unique NFT. Way more expensive in gas, and over-modelled: credits inside a project _are_ fungible with each other.

ERC-1155 sits in the middle. One contract, many project batches, each fungible internally. `mint()` is behind `MINTER_ROLE` and calls `registry.recordIssuance()` so the registry's issuance tally stays consistent. The function that matters most is `retire()`. It burns the caller's tokens and emits `CreditsRetired`. That event is the receipt. Auditors, regulators, ESG reporters — all of them can resolve a claim to a specific burn transaction on Sepolia. No recycling, no re-listing, no second life.

### 3.3 Marketplace

This one's an escrowed ERC-1155 listing book. Sellers call `list()`, which immediately transfers their credits into the marketplace contract (they have to `setApprovalForAll` once). Buyers call `buy()` with ETH. The contract transfers credits, pays the seller, takes a protocol fee, and refunds any overpayment in one atomic call.

A few things I'm glad I nailed:

1. **Checks → effects → interactions.** State is updated _before_ the first external call. `l.amount -= amount; if (l.amount == 0) l.active = false;` runs before the ERC-1155 transfer and before any ETH payouts. That ordering is the textbook defence against re-entrancy.
2. **`ReentrancyGuard` anyway.** Belt and braces. ETH transfers use low-level `call` which has no gas limit, so in principle a malicious seller contract could try to re-enter. I'm not going to rely on ordering alone.
3. **Custom errors everywhere.** `NotSeller`, `InsufficientPayment`, `InvalidFee`, and so on. Cheaper than string reverts and far easier to decode on the client — ethers v6 surfaces them directly via `revertedWithCustomError`.
4. **Fee capped in two places.** 1000 bps (10%) hard cap, checked in the constructor _and_ in `setFee`. An owner cannot accidentally or deliberately set a 50% fee on existing listings.

All three contracts are **verified on Etherscan** (addresses in the README). The bytecode on Sepolia matches the source in this repo, byte for byte.

## 4. Back-end: the indexer problem

This is the part I most enjoyed re-architecting. The first version of the back-end was a long-running Express server with ethers' WebSocket event listeners. It worked locally. It fell apart on free-tier hosting. Render's free dyno sleeps after fifteen minutes of idle — exactly long enough for public RPCs to drop the subscription. The server wakes up, the subscription is dead, and events start going to `/dev/null` silently. Not great.

I rewrote the indexer as a **checkpointed poll** and moved everything into Vercel serverless functions colocated with the frontend. One deploy, one URL, no Express.

Here's how `/api/sync` works:

- A single `Meta` document in Mongo stores `lastBlock` — the last block the indexer has processed.
- The endpoint reads that, queries `registry.queryFilter(...)` and `market.queryFilter(...)` in 45,000-block chunks (public RPCs cap `eth_getLogs` at 50k per call), writes each event as a Mongo upsert, and advances the checkpoint.
- Vercel's cron fires it daily (the free-tier minimum). A secondary cron-job.org monitor hits it every minute for sub-hour freshness.

The nice property is that this is **idempotent by construction**. Every write is an `updateOne` keyed by the event's natural id (`projectId`, `listingId`). Run it twice on the same range and nothing changes. Wipe Mongo entirely and the next sync rebuilds the whole state from Sepolia.

Other serverless-specific things I had to deal with:

- **Connection pooling.** Mongoose is expensive to initialise. I cache the connection promise on `global._mongoPromise` so warm invocations reuse the pool.
- **Multipart uploads.** Vercel's Node runtime skips body-parsing for `multipart/form-data`, which is what I needed for image uploads. `formidable` reads the raw stream and I cap images at 4 MB.
- **ESM extensions.** Vercel runs the compiled `api/*.js` under Node's ESM loader, which requires explicit `.js` extensions on relative imports. TypeScript lets you write `from './mongo'` but the runtime wants `from './mongo.js'`. Got bitten by this in production before I understood why.

## 5. Frontend

The frontend is React + Vite. Two route trees: `/` is the marketing landing (public), `/app/*` is the application behind a navbar with Dashboard / Registry / Market.

State is small. Two contexts:

- `WalletProvider` wraps MetaMask — exposes address, chainId, signer, and a `connect()` action. Also detects when no browser wallet is present, in which case write actions show an `InstallWalletCard` linking to MetaMask, Rabby and Coinbase Wallet instead of silently failing.
- `TxProvider` is a four-state banner: `signing → mining → success | error`. Every on-chain write — register, approve, mint, list, buy, cancel, retire — goes through `tx.run("Mint credits", () => contract.mint(...))`. The banner drives itself, shows the tx hash with an Etherscan link, and catches `user rejected` / `insufficient funds` into friendly copy.

Three deliberate product choices:

1. **Public by default.** The read API has no auth. Someone landing on the site can see every project, every listing, every stat, without ever clicking Connect Wallet. The wallet is only demanded when the user actually wants to sign something.
2. **IPFS metadata in the client.** Project name, description, and image come from Pinata, fetched client-side from `ProjectMeta.tsx` with `ipfs.io` and Cloudflare as fallbacks. Keeps the backend stateless for project detail.
3. **Neo-brutalist design system.** 3 px black borders, hard offset shadows, Bricolage Grotesque display on JetBrains Mono body, high-contrast cream/red/yellow/green palette. It's loud on purpose. It's also accidentally accessible — the contrast ratios and thick focus outlines satisfy WCAG AA without extra work.

A top-level `ErrorBoundary` catches anything uncaught and renders a recover-and-retry screen instead of a blank page. Small thing, rescues the user when something I didn't anticipate breaks.

## 6. Quality and CI

The repo is an npm workspace with two member packages (`contracts`, `frontend`). GitHub Actions runs on every push: ESLint with zero warnings allowed, Solhint, Prettier format-check, and the full Hardhat test suite. Husky + lint-staged replay the same checks on every local commit, so things fail early instead of in CI.

The numbers:

- **13 passing Chai tests** covering the complete `register → approve → mint → list → buy → cancel → retire` flow.
- **Hardhat coverage: 91% statements, 91% lines, 83% functions.** The uncovered branches are mostly fallback revert paths hit only by adversarial inputs, which I'd pick up with a fuzz campaign if I had more time.
- **Solhint**: zero violations, pinned to Solidity `^0.8.24`.
- **ESLint**: zero warnings across the TypeScript + JSX codebase with `react-hooks` strict rules.
- **TypeScript strict mode** on both the Vite frontend and the separate Node tsconfig for the serverless functions.

Commit history uses conventional-commits prefixes. Every commit is attributed to my GitHub account through a noreply email so the repo page shows my avatar throughout.

## 7. Security — what I thought about

I didn't run a formal audit (this is coursework), but I walked through the obvious threats and documented how each is mitigated:

| Threat                        | Mitigation                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Re-entrancy on `buy`          | Checks-effects-interactions + `ReentrancyGuard`                                |
| Unauthorised minting          | `MINTER_ROLE`; mint also checks the registry's approval status                 |
| Double-counting               | ERC-1155 with unique project ids; transfers move credits, retire burns them    |
| Retirement fraud              | `retire()` is a real burn; the `CreditsRetired` event is the audit trail       |
| Owner raising fees mid-market | 10% cap enforced in constructor _and_ `setFee`                                 |
| Silent ETH payout failure     | Every `.call` is return-checked with `TransferFailed` custom error             |
| Leaked secrets                | `.env` gitignored in all workspaces; Vercel holds production secrets encrypted |
| Malicious verifier            | Role is revocable by admin; documented limitation that prod needs a multisig   |

If I were shipping to mainnet I'd add Slither, Mythril, and a Foundry invariant test suite before going live. None of those are hard, they just take time I didn't have this sprint.

## 8. What's not here yet

Honest limitations I'd address in v2:

- **Verifier centralisation.** A single EOA holds `VERIFIER_ROLE`. That's fine for a test deployment, fatal in production. Swap for a Gnosis Safe with a formal MRV pipeline (measurement, reporting, verification) behind it.
- **Cron cadence.** Vercel's free tier caps cron at daily. cron-job.org fills the gap for me, but a proper paid plan (or a self-hosted trigger) is the right answer long-term.
- **Chain lock-in.** Sepolia only. The contracts are chain-agnostic — adding Polygon or Arbitrum is a config change plus a small chain-switcher in the UI. No Solidity changes required.
- **No off-chain attestation trail.** Credits are backed by whatever the verifier looked at off-chain. An EIP-712-signed attestation document would close that loop cleanly. Natural next feature.

## 9. Deliverables

| Deliverable                 | Where                                                                        |
| --------------------------- | ---------------------------------------------------------------------------- |
| Source code                 | [`/contracts`](./contracts), [`/frontend`](./frontend)                       |
| Tests (13 passing, 91% cov) | [`contracts/test/Greenify.test.ts`](./contracts/test/Greenify.test.ts)       |
| CI pipeline                 | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)                     |
| Deployed addresses          | [`contracts/deployments/sepolia.json`](./contracts/deployments/sepolia.json) |
| Installation manual         | [`SETUP.md`](./SETUP.md)                                                     |
| Repo README                 | [`README.md`](./README.md)                                                   |
| Live demo                   | <https://greenifyrc.vercel.app>                                              |

## 10. References

1. UNDP Climate Promise (2022). _What are carbon markets and why are they important?_ <https://climatepromise.undp.org/news-and-stories/what-are-carbon-markets-and-why-are-they-important>
2. The Guardian (2023). _Revealed: more than 90% of rainforest carbon offsets by biggest certifier are worthless, analysis shows._ <https://www.theguardian.com/environment/2023/jan/18/revealed-forest-carbon-offsets-biggest-provider-worthless-verra-aoe>
3. World Bank (2023). _State and Trends of Carbon Pricing 2023._ <https://openknowledge.worldbank.org/entities/publication/58f2a409-9bb7-4ee6-899d-be47835c838f>
4. OpenZeppelin Contracts v5.0 documentation. <https://docs.openzeppelin.com/contracts/5.x/>
5. Ethereum EIP-1155: Multi Token Standard. <https://eips.ethereum.org/EIPS/eip-1155>
6. Vercel Serverless Functions — Node.js runtime docs. <https://vercel.com/docs/functions/runtimes/node-js>
7. MongoDB (2024). _Atlas free cluster connection best practices._ <https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/>
