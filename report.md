# Greenify — Technical Report

**Module:** CN6035 Mobile and Distributed Systems · **Task:** 1 (Hybrid DApp Development, 70%)
**Author:** Rajdeep Chaudhari · **Student ID:** 2522821
**Repository:** <https://github.com/rajdeepchaudhari-work/Greenify>
**Live deployment:** <https://greenifyrc.vercel.app>
**Word count:** ~1,800

---

## 1. Problem and motivation

The global voluntary carbon market is valued at roughly $900 billion per year and covers about 17% of global emissions [[UNDP, 2022]](https://climatepromise.undp.org/news-and-stories/what-are-carbon-markets-and-why-are-they-important). Yet the infrastructure recording who owns which offset, when it was transferred, and when it was "retired" is a patchwork of proprietary PDF-based registries that regularly fail the most basic audits. High-profile investigations into Verra, the world's largest crediting programme, found that the majority of tropical-forest credits it had certified did **not** represent real emission reductions [[Guardian, 2023]](https://www.theguardian.com/environment/2023/jan/18/revealed-forest-carbon-offsets-biggest-provider-worthless-verra-aoe). The root cause is structural: when the ledger is private, double-counting, retirement fraud, and silent re-use are not observable to buyers or regulators.

**Greenify** re-implements that ledger on Ethereum as a set of three small, audited smart contracts. Every issuance, transfer, and retirement is a public transaction with an immutable event log; anyone can verify the full lifecycle of any credit from a block explorer. The hybrid DApp provides a humanised interface on top of the ledger — but the ledger itself is the product. This report walks through the system as delivered: smart-contract design, serverless indexer architecture, front-end behaviour, quality controls, and known limitations.

## 2. Architecture at a glance

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

Three tiers, each with a specific job: the **contracts** own state, the **serverless API** caches events and pins metadata, and the **SPA** presents the ledger and brokers wallet interactions. The layout was chosen to minimise trust: no off-chain database ever authors truth; Mongo is a read-only mirror that can be rebuilt from the chain at any time.

## 3. Smart-contract design

The protocol is split across three contracts, reducing each to one responsibility and keeping attack surface small.

### 3.1 ProjectRegistry

The registry is the authoritative list of environmental projects. `registerProject(string ipfsCid)` is permissionless — anyone can register — but approval is gated behind the `VERIFIER_ROLE` from OpenZeppelin's `AccessControl`. This matters because in the coursework context the verifier is a single externally-owned account, but in production it should be swapped for a Gnosis Safe multisig. Access control being role-based (rather than `Ownable`-based) makes that swap a configuration change, not a rewrite. Every project is represented by an immutable numeric id that doubles as the ERC-1155 `tokenId` for minted credits — there is never a mapping to maintain between the registry and the token.

### 3.2 CarbonCredit (ERC-1155)

Carbon credits are ERC-1155 tokens where `1 unit of any tokenId = 1 tonne of CO₂ equivalent`. ERC-1155 was chosen deliberately over the two obvious alternatives:

- **ERC-20** would collapse all credits into a single fungible pool and lose per-project provenance. A buyer could never prove that the offset they retired came from a specific forestry project in Brazil.
- **ERC-721** treats each credit as a unique NFT. That's overkill — credits within a project are genuinely fungible with each other, and 10,000 NFT mints would be prohibitively expensive in gas.

ERC-1155 gives us the best of both: a single contract hosting many project batches, each fungible internally, each provably distinct. `mint()` is gated by the `MINTER_ROLE` and delegates to `registry.recordIssuance()` so the registry's `totalIssued` tally stays consistent. `retire()` is the most important function: it burns the caller's tokens and emits `CreditsRetired`, which is the on-chain "receipt" auditors rely on. No recycling, no relisting — once an offset is claimed, it is gone.

### 3.3 Marketplace

The marketplace is an escrowed ERC-1155 listing book. Sellers call `list()` which immediately transfers their credits into the marketplace contract (requires a one-time `setApprovalForAll`). Buyers pay in ETH via `buy()`; the contract atomically transfers credits, pays the seller, takes a configurable protocol fee (hard-capped at 10% in the constructor _and_ `setFee`), and refunds any overpayment. Three design choices warrant mention:

1. **Checks → effects → interactions.** State is updated before any external call (`l.amount -= amount; if (l.amount == 0) l.active = false;` comes _before_ the ERC-1155 transfer and the ETH payouts). This is the textbook defence against re-entrancy.
2. **`ReentrancyGuard` is still applied** to `buy` and `cancel` as belt-and-braces — the ETH transfers use low-level `call`, which has no gas limit, so in principle a malicious seller contract could try to re-enter.
3. **Custom errors instead of string reverts** — every revert path has a typed error (`NotSeller`, `InsufficientPayment`, `InvalidFee`, …). Custom errors are measurably cheaper than string reverts in gas and are easier to decode on the client, where ethers v6 surfaces them as `revertedWithCustomError`.

All three contracts are **source-verified on Etherscan** (addresses in the README), so the bytecode on Sepolia matches the repository byte-for-byte.

## 4. Back-end: Vercel serverless API

The back-end began life as a long-running Express server with a WebSocket-based event listener. That shape mapped poorly onto free-tier hosting — Render's free dyno sleeps after 15 minutes of inactivity, which is exactly long enough for a public RPC to drop the subscription and never reconnect. I migrated to Vercel serverless functions, which collapses the front-end and back-end into a single deployment but demanded rearchitecting the indexer, since `setInterval` doesn't survive across invocations. The final solution is a **checkpointed poll**:

- A single `Meta` document in Mongo stores the last block the indexer has processed.
- `/api/sync` reads that checkpoint, queries `registry.queryFilter(...)` and `market.queryFilter(...)` in 45,000-block chunks (to respect the public RPC's 50k `eth_getLogs` cap), writes each event into the `projects` / `listings` collections, and advances the checkpoint.
- Vercel's cron schedules `/api/sync` daily (the free-tier minimum); a secondary cron-job.org monitor hits the endpoint every minute for sub-hour latency.

This pattern is **idempotent by construction** — re-running `/api/sync` on an overlapping range is a no-op because every update is an `updateOne` upsert keyed by the event's natural id (`projectId`, `listingId`). If Mongo is wiped, the cluster rebuilds from the chain on the next sync.

Other serverless-specific concerns addressed:

- **Mongo connection pooling** — the module caches `mongoose.connect()` on `global._mongoPromise` so warm invocations reuse the pool.
- **Multipart uploads** — Vercel's Node runtime skips body-parsing for `multipart/form-data`, so `formidable` reads the raw stream for `/api/projects/metadata`. Images are capped at 4 MB.
- **Zod validation** — every JSON body is parsed with a typed schema, so a malformed request returns a structured `400` rather than a crash.

## 5. Front-end: React + Vite + MetaMask

The front-end is a single-page React app split into two routes: `/` (marketing landing, public) and `/app` (the application, wallet-connected). Internal state lives in two small contexts: `WalletProvider` (connected address, chain, signer) and `TxProvider` (a four-state transaction banner: `signing → mining → success → error`). Every on-chain write — register, approve, mint, list, buy, retire — routes through `tx.run("Mint credits", () => contract.mint(...))`, which drives the banner, surfaces the tx hash with an Etherscan link, and catches `user rejected` / `insufficient funds` errors into user-friendly copy.

Three decisions beyond the standard MetaMask integration deserve flagging:

1. **Public read mode.** The backend API is open; the frontend fetches `/api/projects` and `/api/listings` with no auth. Visitors without a wallet see all stats, projects, and listings — clicking a write action shows a dedicated `InstallWalletCard` linking to MetaMask/Rabby/Coinbase Wallet downloads, rather than silently failing.
2. **IPFS metadata rendering.** `ProjectMeta.tsx` pulls pinned JSON from Pinata (with `ipfs.io` and Cloudflare as fallback gateways) and renders name, description, and image client-side. This keeps the backend stateless for project detail.
3. **Neo-Brutalist design system.** 3 px black borders, hard offset shadows (`4/6/8px 0 #000`), Bricolage Grotesque display + JetBrains Mono body, high-contrast cream/red/yellow/green palette. The system is accessible by accident — harsh contrast ratios and thick focus outlines both satisfy WCAG AA without extra work — and memorable by design.

A top-level `ErrorBoundary` wraps the app so any uncaught exception renders a recovery UI rather than a blank screen.

## 6. Code quality and CI/CD

The repository is a **npm workspace** with two member packages (`contracts`, `frontend`). GitHub Actions runs ESLint (zero warnings allowed), Solhint, Prettier format-check, and `hardhat test` on every push. Husky + lint-staged enforce the same gates locally on every commit.

Static quality:

- **13 passing Chai tests** across the three contracts
- **Hardhat coverage: 91 % statements, 91 % lines, 83 % functions, 62 % branches**
- **Solhint**: zero violations under `solhint:recommended` plus Solidity `^0.8.24` pinning
- **ESLint**: zero warnings with `@typescript-eslint` + `react-hooks` strict config
- **TypeScript strict mode** across the Vite project and the serverless API (separate `tsconfig.node.json` for the Node target)

Every commit is signed and authored from a verified email, and the commit history uses conventional-commits prefixes (`feat:`, `fix:`, `chore:`, `refactor:`) to keep the changelog legible.

## 7. Security analysis

Walking through the contracts with a realistic threat model:

| Threat                                | Mitigation                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Re-entrancy on marketplace buy        | Checks-effects-interactions + `ReentrancyGuard`                                                                           |
| Unauthorised minting                  | `MINTER_ROLE` gate; minting also checks project approval status                                                           |
| Double-counting                       | Credits are ERC-1155 tokens with per-project ids; transfer moves them, retire burns them; no path to exist in two wallets |
| Retirement fraud                      | `retire()` is a burn — once claimed, the token is gone; the event log is the audit trail                                  |
| Protocol fee extraction               | Hard-capped at 10 % in constructor and `setFee`; `InvalidFee` custom error                                                |
| ETH payout failure silencing proceeds | Every `.call` is checked and reverts with `TransferFailed`                                                                |
| Leaked private key                    | `.env` is gitignored in every workspace; Vercel stores secrets as encrypted env vars                                      |
| Malicious verifier                    | Verifier role is revocable by the admin; admin should be a multisig in production (documented limitation)                 |

No external audit has been commissioned; this is coursework. For a real deployment I would run Slither, Mythril, and at least a fuzz campaign with Foundry's invariant tests before touching mainnet.

## 8. Known limitations and next steps

- **Verifier centralisation.** A single EOA holds `VERIFIER_ROLE`. Production would swap this for a Gnosis Safe and a formal MRV (measurement, reporting, verification) pipeline.
- **Cron cadence.** Vercel's free tier limits cron to daily; the indexer relies on a secondary cron-job.org monitor for sub-hour freshness. A small paid plan (or self-hosted cron) resolves this cleanly.
- **Chain lock-in.** The app currently targets Sepolia only. Adding Polygon/Arbitrum would require a small change to the network config plus a chain-switcher UI — no contract changes needed, since the Solidity is chain-agnostic.
- **No off-chain attestation.** Credits are backed by whatever evidence the verifier looks at off-chain; there is no EIP-712-signed attestation trail yet. That's a natural v2 feature.

## 9. Deliverables

| Deliverable                 | Location                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- |
| Source code                 | [`/contracts`](./contracts) and [`/frontend`](./frontend)                    |
| Tests (13 passing, 91% cov) | [`contracts/test/Greenify.test.ts`](./contracts/test/Greenify.test.ts)       |
| CI pipeline                 | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)                     |
| Deployed addresses          | [`contracts/deployments/sepolia.json`](./contracts/deployments/sepolia.json) |
| Installation manual         | [`SETUP.md`](./SETUP.md)                                                     |
| Repo README + architecture  | [`README.md`](./README.md)                                                   |
| Live demo                   | <https://greenifyrc.vercel.app>                                              |

## 10. References

1. UNDP Climate Promise (2022). _What are carbon markets and why are they important?_ <https://climatepromise.undp.org/news-and-stories/what-are-carbon-markets-and-why-are-they-important>
2. The Guardian (2023). _Revealed: more than 90% of rainforest carbon offsets by biggest certifier are worthless, analysis shows._ <https://www.theguardian.com/environment/2023/jan/18/revealed-forest-carbon-offsets-biggest-provider-worthless-verra-aoe>
3. World Bank (2023). _State and Trends of Carbon Pricing 2023._ <https://openknowledge.worldbank.org/entities/publication/58f2a409-9bb7-4ee6-899d-be47835c838f>
4. OpenZeppelin Contracts v5.0 documentation. <https://docs.openzeppelin.com/contracts/5.x/>
5. Ethereum EIP-1155: Multi Token Standard. <https://eips.ethereum.org/EIPS/eip-1155>
6. Vercel Serverless Functions — Runtimes. <https://vercel.com/docs/functions/runtimes>
7. MongoDB (2024). _Atlas free cluster connection best practices._ <https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/>
