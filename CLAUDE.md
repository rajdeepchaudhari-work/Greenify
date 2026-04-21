# Greenify — Claude Code Project Guide

Greenify is a hybrid DApp for trading carbon credits on Ethereum. Built for **CN6035 Task 1 (70%)** at Level 6. Marking: Back-end 20 / Blockchain 20 / Front-end 20 / Code Quality & VCS 10.

## Stack

- **Contracts**: Solidity 0.8.24, Hardhat, OpenZeppelin, deployed to **Sepolia**
- **Token**: ERC-1155 (one contract, many project credit batches)
- **Frontend**: React + Vite + TailwindCSS + ethers.js v6 + MetaMask
- **Backend**: Node.js + Express + MongoDB (Mongoose) + Pinata (IPFS)
- **Quality**: ESLint, Prettier, Solhint, Husky + lint-staged, Chai (contracts), Jest (backend)
- **CI**: GitHub Actions (lint + contract tests on push)

## Repo layout

```
contracts/   Hardhat: ProjectRegistry, CarbonCredit (ERC-1155), Marketplace
backend/     Express API + event indexer → MongoDB + IPFS pinning
frontend/    React + Vite, Neo-Brutalist UI
.claude/skills/   UI & design skills (project-local)
.agents/skills/   Solidity skills (test-hardhat, audit, gas-optimize, test-foundry)
```

## Key commands

```bash
# root
npm install                        # installs all workspaces

# contracts
cd contracts
npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts --network sepolia

# backend
cd backend
npm run dev
npm test

# frontend
cd frontend
npm run dev

# quality (root)
npm run lint
npm run format
```

## Skills to use

Consult these before writing code in the matching area:

- [.claude/skills/brutalism-ui/SKILL.md](.claude/skills/brutalism-ui/SKILL.md) — UI styling rules (Neo-Brutalist)
- [.claude/skills/frontend-design/SKILL.md](.claude/skills/frontend-design/SKILL.md) — general layout/interaction
- [.claude/skills/logo-design-guide/](.claude/skills/logo-design-guide/) — logo usage
- [.agents/skills/test-hardhat/SKILL.md](.agents/skills/test-hardhat/SKILL.md) — Hardhat test generation
- [.agents/skills/audit/SKILL.md](.agents/skills/audit/SKILL.md) — run before final submission
- [.agents/skills/gas-optimize/SKILL.md](.agents/skills/gas-optimize/SKILL.md) — after functional tests pass

## UI rules (Neo-Brutalist)

- Palette: Greenify red `#E74C3C`, black `#000`, off-white `#F5F0E8`, accent yellow `#FFD93D`
- Typography: monospace display (`Space Mono` / `JetBrains Mono`), grotesque body
- Borders: 2–4px solid black; chunky offset shadows (`4px 4px 0 #000`), **no** soft/blurred shadows
- No gradients, no rounded-full buttons, no unnecessary animation
- Buttons look like buttons. Inputs have visible outlines. Structure is the decoration.

## Conventions

- **Commits**: conventional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- **Branches**: `feat/<scope>`, `fix/<scope>`; PR into `main`
- **CI must be green** before merging
- **Never commit**: `.env`, private keys, mnemonics, `node_modules`, Hardhat artifacts, coverage
- All contract addresses go in `frontend/src/lib/contracts.ts` and README, never hard-coded in components

## Security

- Use OpenZeppelin's audited contracts — don't reinvent AccessControl, ERC-1155, ReentrancyGuard
- Run the `audit` skill on every contract before Sepolia deployment
- Protocol fee recipient and verifier roles configured via constructor args, never hard-coded
