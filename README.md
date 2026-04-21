# Greenify

A hybrid DApp for trading tokenised carbon credits on Ethereum Sepolia.

Built for **CN6035 Task 1** — Hybrid DApp Development.

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  React + Vite       │───▶│  Express + Mongo    │
│  (Neo-Brutalist UI) │     │  (IPFS + Indexer)   │
│  ethers.js + MM     │     │  Event listener     │
└──────────┬──────────┘     └──────────┬──────────┘
           │ wallet tx                 │ JSON-RPC (read events)
           ▼                           ▼
      ┌────────────────────────────────────┐
      │  Sepolia Testnet                   │
      │  ProjectRegistry ─ CarbonCredit ─ Marketplace
      │  (ERC-1155)                        │
      └────────────────────────────────────┘
```

### Contracts

- **ProjectRegistry** — register environmental projects (IPFS CID), verifier approval, issuance accounting.
- **CarbonCredit** (ERC-1155) — `projectId == tokenId`, 1 unit = 1 tCO₂e. Mintable only for approved projects. Holders can `retire()` (burn) to claim offset.
- **Marketplace** — escrowed ERC-1155 listings with per-unit pricing, reentrancy-guarded buys, configurable protocol fee (capped 10%).

### Backend

- REST API (`/api/projects`, `/api/listings`) backed by MongoDB.
- Pinata-backed IPFS pinning for project metadata + images.
- Event indexer subscribes via ethers.js and mirrors on-chain state into Mongo for fast queries.

### Frontend

- React + Vite SPA.
- MetaMask (EIP-1193) via `ethers.BrowserProvider`.
- Neo-Brutalist design system — thick black borders, chunky offset shadows, monospace display, Greenify red `#E74C3C` / yellow `#FFD93D` accents.

---

## Prerequisites

- Node.js 20+, npm 10+
- MongoDB 7+ running locally (`brew install mongodb-community` or Docker)
- A Sepolia RPC URL (Infura / Alchemy)
- Funded Sepolia account (use [sepoliafaucet.com](https://sepoliafaucet.com))
- Pinata JWT ([pinata.cloud](https://pinata.cloud))
- MetaMask browser extension

---

## Install

```bash
git clone https://github.com/<YOUR-USER>/Greenify.git
cd Greenify
npm install
```

### Environment

Copy and fill all three `.env.example` files:

```bash
cp contracts/.env.example contracts/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Run locally

### 1. Compile + test contracts

```bash
cd contracts
npx hardhat compile
npx hardhat test
npx hardhat coverage          # optional
```

### 2. Deploy to Sepolia

```bash
cd contracts
npm run deploy:sepolia
```

Addresses are written to `contracts/deployments/sepolia.json`. Copy them into:

- `backend/.env` → `REGISTRY_ADDRESS`, `CREDIT_ADDRESS`, `MARKET_ADDRESS`
- `frontend/.env` → `VITE_REGISTRY_ADDRESS`, `VITE_CREDIT_ADDRESS`, `VITE_MARKET_ADDRESS`

### 3. Start backend

```bash
cd backend
npm run dev
# → http://localhost:4000  (health check at /health)
```

### 4. Start frontend

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

Open the frontend, connect MetaMask on Sepolia, and run the full flow (register → approve → mint → list → buy → retire).

---

## Quality gates

```bash
npm run lint            # ESLint (TS/JS)
npm run lint:sol        # solhint (Solidity)
npm run format:check    # Prettier
npm run test:contracts  # Hardhat tests
npm run test:backend    # Jest
```

CI runs all of the above on every push/PR — see `.github/workflows/ci.yml`.

Husky + lint-staged auto-format and lint on `git commit`.

---

## Deployed addresses (Sepolia)

| Contract        | Address                                      | Etherscan                                                                                    |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ProjectRegistry | `0x86B861a6F7E4B10CD96B7491fFA6a0967441142b` | [view](https://sepolia.etherscan.io/address/0x86B861a6F7E4B10CD96B7491fFA6a0967441142b#code) |
| CarbonCredit    | `0x4272be407BA26d9aD469E5951e549eD36932bB9E` | [view](https://sepolia.etherscan.io/address/0x4272be407BA26d9aD469E5951e549eD36932bB9E#code) |
| Marketplace     | `0x8BEdAf9e29aC4FBa25D679Dc8Fa4AdAc126a6403` | [view](https://sepolia.etherscan.io/address/0x8BEdAf9e29aC4FBa25D679Dc8Fa4AdAc126a6403#code) |

---

## Project layout

```
contracts/      Hardhat project (Solidity, tests, deploy scripts)
backend/        Express + Mongoose + indexer + Pinata
frontend/       React + Vite + Tailwind (Neo-Brutalist)
.claude/        Project-local Claude Code config + skills
.agents/skills/ Solidity dev skills (test-hardhat, audit, gas-optimize)
```

## License

MIT
