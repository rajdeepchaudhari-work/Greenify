# Greenify — Marketing & Product Copy

Source of truth for all landing page, app, and social copy. Edit here first, then pull into the site.

---

## 1. Brand

**Name** Greenify
**Category** On-chain carbon credit infrastructure
**Built by** Rajdeep Chaudhari
**Concept by** EagerHQ.com
**Status** Live on Ethereum Sepolia testnet

### Voice

- Plain-spoken. No climate jargon, no web3 jargon. If a policy wonk and an engineer both read it, both should get it.
- Confident. We do one thing — put carbon credits on a public ledger — and we say it directly.
- Mildly confrontational with the status quo. Carbon markets earned the skepticism.
- Never preachy. We're infrastructure, not activism.

### What we don't sound like

- "Sustainable solutions for a greener tomorrow" (dead).
- "Revolutionary web3 climate protocol" (overclaimed).
- "Carbon-neutral carbon credits" (meaningless).

---

## 2. One-liners

Use the one that fits the surface. Shortest first.

- **Carbon credits. On a public ledger.**
- **Carbon offsets you can actually verify.**
- **Mint. Trade. Retire. All on-chain.**
- **The carbon credit registry that can't lie.**
- **A public ledger for a $900B market that runs on PDFs.**

---

## 3. Hero (landing top)

### H1

Put a price on carbon. On-chain.

### Sub

Greenify turns verified environmental projects into ERC-1155 tokens you can trade and retire on Ethereum. Every mint, sale, and retirement is a public transaction — no middlemen, no missing spreadsheets, no double-counting.

### Buttons

- Primary: **Launch App →**
- Secondary: **Verified on Etherscan ↗**
- Ghost: **Read the code ↗**

### Credibility strip (under hero)

`LIVE ON SEPOLIA · 3 CONTRACTS · ERC-1155 · OPEN SOURCE · MIT`

---

## 4. The problem

### Section title

Carbon markets are a black box.

### Lead

A 900-billion-dollar industry runs on PDFs, spreadsheets, and trust-us registries. That isn't accounting — it's theatre.

### Three failures

**01 · Double-counting**
The same offset gets sold to two buyers by two different registries. Nobody catches it because nobody can see the full ledger.

**02 · Retirement fraud**
Credits "retired" by one firm quietly reappear on another firm's ESG report six months later.

**03 · Zero auditability**
Want to verify a claim? Email a PDF. Wait three weeks. Pray the registry still exists.

---

## 5. The solution

### Section title

Three contracts. One flow. Public by default.

### Lead

Everything a carbon credit does — issuance, transfer, retirement — lives on three audited smart contracts and nothing else. The ledger is the product.

### Three steps

**01 · Register & verify**
Project owners pin evidence + metadata to IPFS. A verifier role approves the project on-chain. Every project gets a permanent, immutable ID.

**02 · Mint & trade**
Approved projects mint ERC-1155 credits — 1 token = 1 tonne CO₂e. List them on the built-in marketplace. Buyers settle instantly in ETH.

**03 · Retire & prove**
Holders call `retire()` to burn credits permanently. The on-chain event is the receipt. Regulators, auditors, anyone can verify from a block explorer in 10 seconds.

---

## 6. What makes it different

_Short list for a "Why Greenify" section._

- **Public ledger, not a private database.** Every project, listing, and retirement is on Ethereum. You don't trust us — you check.
- **One token = one tonne.** ERC-1155 with project IDs baked in. Provenance is native to the token, not bolted on.
- **Burn-to-claim retirement.** Offsets are gone from circulation the moment they're used. No recycling, no relisting.
- **Open source, end to end.** Contracts, indexer, frontend, deployment scripts — all on GitHub, MIT-licensed.
- **No custody, no KYC.** You hold your credits in your wallet. We never touch them.

---

## 7. How a visitor becomes a user

Progressive disclosure — each step is a CTA variant.

1. **Browse without a wallet.** See every project, every listing, every price. No signup.
2. **Connect MetaMask.** Switch to Sepolia. Get free test ETH from a faucet (link).
3. **Pick a role.**
   - _Project owner_ → register your project, upload evidence.
   - _Verifier_ → approve vetted projects, mint credits.
   - _Buyer_ → purchase offsets from the marketplace.
   - _Retiree_ → burn credits to claim the offset on your ESG report.
4. **Everything is a transaction.** Share the Etherscan link. That's your audit trail.

---

## 8. Live stats block

Pulled from the deployed contracts in real time. Labels:

- **Projects** — total registered, all time
- **Approved** — green-lit by a verifier
- **Active listings** — currently for sale
- **Credits issued** — `tCO₂e` minted across all projects

Caption under the grid:

`Numbers don't negotiate. These are the on-chain totals, refreshed every 20 seconds.`

---

## 9. Tech stack (for the "Built with" wall)

Two groups, in order of visibility.

**On-chain**
Solidity 0.8.24 · OpenZeppelin · Hardhat · ethers.js v6 · ERC-1155 · Ethereum Sepolia

**Off-chain**
React + Vite · TailwindCSS · MetaMask · Express · MongoDB · IPFS via Pinata

Caption:

`No proprietary black boxes. Every dependency is open-source, audited, and inspectable.`

---

## 10. FAQ

**Is this production?**
No. Greenify is live on Sepolia testnet as a CN6035 Task 1 deliverable. The same contracts would deploy to mainnet with zero changes — but credit issuance in the real world needs an off-chain verification pipeline (MRV providers, registry partnerships) we haven't built yet.

**How do you stop double-counting?**
Every credit is an ERC-1155 token with a project ID. Once minted, it exists in exactly one wallet. Transferring moves it. Retiring burns it. There's no path to exist in two places at once.

**Can I cheat the verifier?**
A compromised verifier can approve a fraudulent project. We limit damage by (a) making every approval a public event, (b) allowing the admin to revoke the verifier role, and (c) keeping all project metadata pinned to IPFS where tampering is visible. A production deploy would use a multisig verifier role, not a single EOA.

**What chain does it deploy to?**
Currently Sepolia. The contracts are chain-agnostic — they'd run on Polygon, Arbitrum, Base, or Ethereum mainnet with only network config changes. We picked Sepolia because it's free and faucets are easy.

**Why ERC-1155 and not ERC-20 or ERC-721?**

- ERC-20 would make all credits fungible across projects. Bad — you'd lose project provenance.
- ERC-721 gives each credit a unique NFT. Overkill — credits are fungible _within_ a project.
- ERC-1155 lets one contract hold many project batches, each fungible internally. It's the right shape.

**Is my wallet key sent to your server?**
No. Never. MetaMask signs transactions locally and only the signed hex goes to the RPC node. The backend only reads public blockchain events; it never sees your private key.

**Can I use it without MetaMask?**
You can browse the app — view projects, listings, stats — without a wallet. You can't _transact_ without one. That's a blockchain constraint, not a product choice.

---

## 11. CTA blocks

### Primary CTA (repeat under every section)

**Ready to offset?**
Launch App → | View source ↗

### Mid-page CTA

**See the protocol in action.**
Connect a wallet, claim Sepolia ETH, and trade a real on-chain credit in under five minutes.
Launch App →

### Final CTA

**Mint. Trade. Retire.**
No sign-up. No KYC. No spreadsheets.
Launch App → | View source ↗

---

## 12. Footer

### Left

**GREENIFY**
Carbon credit protocol. Live on Sepolia.

### Right (links)

- GitHub
- Etherscan — ProjectRegistry
- Etherscan — CarbonCredit
- Etherscan — Marketplace
- Docs

### Colophon

Built by [Rajdeep Chaudhari](https://github.com/rajdeepchaudhari-work) · Concept by [EagerHQ.com](https://eagerhq.com) · MIT License

---

## 13. Tagline A/B pool

For posters, decks, and social. All interchangeable.

- Proof, not promises.
- The receipt is the ledger.
- If you can't verify the offset, you don't have an offset.
- Every credit, every trade, every burn — on-chain.
- Carbon accounting that audits itself.

---

## 14. Manifesto quote (for a dark slide)

> If you can't prove the offset happened,
> you don't have an offset.

Attribution: _The Greenify Manifesto_
