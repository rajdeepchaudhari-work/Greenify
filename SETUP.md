# Greenify — First-Time Setup

A step-by-step guide for setting up the project from scratch. If you are new to Web3 dev, follow in order — every step tells you exactly what to copy where.

## 0. Install prerequisites (one-time)

Check you have them:

```bash
node --version      # need 20+
npm --version       # need 10+
git --version
```

Install missing ones:

- **Node.js 20+**: https://nodejs.org (or `brew install node@20` on macOS)
- **MongoDB Community 7+**:
  - macOS: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
  - Linux/Windows: https://www.mongodb.com/try/download/community
- **MetaMask** browser extension: https://metamask.io/download

Verify Mongo is running:

```bash
mongosh --eval "db.runCommand({ping:1})"
# should print: { ok: 1 }
```

---

## 1. Clone and install

```bash
git clone https://github.com/rajdeepchaudhari-work/Greenify.git
cd Greenify
npm install
```

This installs everything across all three workspaces (`contracts/`, `backend/`, `frontend/`).

---

## 2. Create accounts and collect keys

You need **4 things**. Do them in this order:

### 2a. MetaMask wallet (2 min)

1. Install MetaMask extension → create new wallet → save the seed phrase **offline**.
2. Click the network dropdown (top) → **Add network** → **Show test networks** → select **Sepolia**.
3. Copy your wallet address (0x…) — you'll use it as the deployer.
4. **Export the private key for deployment only** (a throwaway test wallet is safest):
   Account menu → Account details → Show private key → enter password → copy.
   This private key goes in `contracts/.env` as `PRIVATE_KEY`. **Never commit it.**

### 2b. Sepolia test ETH (2 min)

You need ~0.1 Sepolia ETH to deploy and play around.

- https://sepoliafaucet.com (Alchemy — needs free Alchemy signup, 0.5 ETH/day)
- https://www.infura.io/faucet/sepolia (needs free Infura signup)
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia (Google, 0.05 ETH/day)

Paste your MetaMask address and claim.

### 2c. Sepolia RPC URL (3 min)

Two options:

- **Free public RPC** (no signup, works out of the box, may rate-limit):
  `https://ethereum-sepolia-rpc.publicnode.com`
- **Infura / Alchemy** (reliable, recommended):
  - Infura: https://infura.io → sign up → Create API key → Networks: Sepolia → copy the HTTPS URL
    (looks like `https://sepolia.infura.io/v3/abc123…`)
  - Alchemy: https://www.alchemy.com → Apps → Create App → Chain: Ethereum, Network: Sepolia →
    View key → HTTPS URL

### 2d. Etherscan API key (2 min, optional but useful)

For automatic contract source verification after deploy.

- https://etherscan.io/register → verify email → API Keys tab → Add → copy key.

### 2e. Pinata JWT (IPFS storage, 2 min)

Project metadata and images get pinned to IPFS.

1. https://app.pinata.cloud/register → sign up (free tier: 1 GB).
2. API Keys → New Key → name "greenify-dev", enable pinning scopes → Create.
3. Copy the **JWT** (the long token, not the API key/secret).

---

## 3. Fill in environment files

There are three `.env.example` files. Copy each, then edit.

```bash
cp contracts/.env.example contracts/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### `contracts/.env`

```
SEPOLIA_RPC_URL=<paste your Sepolia RPC URL from 2c>
PRIVATE_KEY=<paste your MetaMask private key from 2a>
ETHERSCAN_API_KEY=<paste Etherscan key from 2d, or leave blank>
REPORT_GAS=false
```

### `backend/.env`

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/greenify
SEPOLIA_RPC_URL=<same RPC URL as above>
REGISTRY_ADDRESS=   # fill in after step 4
CREDIT_ADDRESS=     # fill in after step 4
MARKET_ADDRESS=     # fill in after step 4
PINATA_JWT=<paste Pinata JWT from 2e>
PINATA_GATEWAY=https://gateway.pinata.cloud
```

### `frontend/.env`

```
VITE_API_URL=http://localhost:4000
VITE_CHAIN_ID=11155111
VITE_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_REGISTRY_ADDRESS=   # fill in after step 4
VITE_CREDIT_ADDRESS=     # fill in after step 4
VITE_MARKET_ADDRESS=     # fill in after step 4
```

---

## 4. Compile, test, deploy contracts

```bash
cd contracts
npx hardhat compile
npx hardhat test
# should see: 13 passing
```

Deploy to Sepolia (takes ~1 minute):

```bash
npm run deploy:sepolia
```

You'll see JSON output like:

```json
{
  "network": "sepolia",
  "contracts": {
    "ProjectRegistry": "0xABC…",
    "CarbonCredit": "0xDEF…",
    "Marketplace": "0x123…"
  }
}
```

Also saved to `contracts/deployments/sepolia.json`.

**Copy these three addresses into `backend/.env` and `frontend/.env`** (both files — six slots total).

---

## 5. Run the app (two terminals)

Terminal 1 — backend:

```bash
cd backend
npm run dev
# [backend] Mongo connected
# [backend] listening on http://localhost:4000
# [indexer] Listening to contract events
```

Terminal 2 — frontend:

```bash
cd frontend
npm run dev
# ➜  Local: http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 6. Try it out

### As a public visitor (no wallet)

Just open the site. You'll see:

- Dashboard with platform stats
- Latest projects
- Open listings

No wallet popup. Good.

### As a project owner

1. Click **Connect Wallet** (top right) → approve in MetaMask.
2. Go to **Registry** tab → fill the form (name, description, optional image) → **Register**.
3. Wait for the MetaMask tx to confirm (~15s on Sepolia).
4. Your project appears in the list as `PENDING`.

### As a verifier (the deployer wallet)

1. Still connected as deployer — click **Approve** on your pending project.
2. Now you can mint: fill recipient + amount → **Mint**.

### As a trader

1. Connect the recipient wallet.
2. Go to **Market** → fill project id, amount, price per unit (e.g. `0.001` ETH) → **List credits**.
   (First listing triggers a one-time ERC-1155 approval tx.)
3. Switch to a second MetaMask account → connect → **Buy** from the listing.

### Retire (claim the offset)

1. On the buyer account, go to **Dashboard** → "Your credits" → **Retire all**.
2. The credits are burned; the `CreditsRetired` event fires.

---

## 7. Common problems

| Problem                                   | Fix                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| `MongoServerSelectionError`               | Mongo isn't running. `brew services start mongodb-community` or start your Docker container. |
| `insufficient funds for gas`              | Top up your deployer wallet from a Sepolia faucet (step 2b).                                 |
| `Error HH502: Couldn't download compiler` | Network issue. Retry `npx hardhat compile`.                                                  |
| Backend logs `indexer disabled`           | Contract addresses not set in `backend/.env`, or RPC URL missing.                            |
| Frontend shows "Contract not deployed"    | Addresses not set in `frontend/.env`. Restart `npm run dev` after editing `.env`.            |
| MetaMask says "Wrong network"             | Click **Switch to Sepolia** in the navbar, or switch manually.                               |
| Pinata 401                                | JWT wrong — regenerate in Pinata and paste the full token.                                   |

---

## 8. Useful commands

```bash
# root
npm run lint              # ESLint
npm run format            # Prettier write
npm run test:contracts    # Hardhat tests

# contracts
cd contracts
npx hardhat coverage      # coverage report
npx hardhat node          # local testnet (chain id 31337)
npm run deploy:local      # deploy to local node

# backend
cd backend
npm test                  # Jest
```

---

## 9. Before you submit

1. Run `npx hardhat coverage` — aim for ≥ 80%.
2. Run the `audit` skill on each contract: in Claude Code, say
   `"Run the audit skill on ProjectRegistry.sol"`.
3. Commit + push all changes.
4. Check GitHub Actions CI is green.
5. Take screenshots of: connect, register, approve, mint, list, buy, retire.
6. Paste deployed addresses into README and the technical report.

That's it. Ping Claude if anything breaks — paste the error and the step you were on.
