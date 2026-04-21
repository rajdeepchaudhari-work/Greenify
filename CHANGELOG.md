# Changelog

All notable changes to Greenify are documented here. Versioning follows
[Semantic Versioning](https://semver.org/) once the project reaches `1.0.0`.

## [0.2.0] — 2026-04-21

### Added

- Serverless API under `frontend/api/*` (Vercel runtime) replacing the Express back-end
- Checkpointed polling indexer (`/api/sync`) with a `Meta` document tracking the last processed block
- `ErrorBoundary` wrapping the SPA for graceful failure recovery
- `InstallWalletCard` surfaced when no browser wallet is detected
- Public `read-only` browsing mode (projects, listings, stats render without a wallet)
- Neo-brutalist landing page at `/` with live platform stats
- Global transaction banner (`useTx`) with `signing → mining → success` states
- Full NatSpec annotations on every public function in all three contracts
- Hardhat coverage report (`91 %` statements) and `CHANGELOG.md`
- Favicon + apple-touch-icon in brand colours
- ARIA labels on icon-only buttons; focus outlines on all interactives

### Changed

- `VITE_API_URL` now defaults to same-origin `/api/*` so no env var is required for Vercel
- `husky` prepare script made optional so Vercel's production install doesn't fail
- MongoDB connection is now cached on a `global` across warm invocations
- Frontend relative imports in `api/*` carry explicit `.js` extensions (required by the Vercel ESM runtime)
- Router split: marketing pages at `/`, app pages at `/app/*`

### Removed

- Long-running Express backend (archived locally as `backend.legacy/`, excluded from the published repo)
- Local-only tooling (`.claude/`, `.agents/`, `content.md`) untracked for a clean submission

## [0.1.0] — 2026-04-21

### Added

- Three smart contracts: `ProjectRegistry`, `CarbonCredit` (ERC-1155), `Marketplace`
- 13 Chai tests covering the complete register → approve → mint → list → buy → cancel → retire flow
- Hardhat deployment script with automatic Etherscan verification
- React + Vite frontend with MetaMask integration, chain-switch prompt, and wallet-gated write actions
- Event indexer + IPFS pinning (Pinata) in the Express backend
- Project metadata rendering from pinned IPFS JSON
- GitHub Actions CI (lint, format-check, tests)
- ESLint + Solhint + Prettier + Husky + lint-staged tooling
- Step-by-step first-run guide (`SETUP.md`)
- Contracts deployed + verified on Ethereum Sepolia
