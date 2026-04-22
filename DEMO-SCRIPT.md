# Greenify — Task 2 Video Demonstration Script

Target length: **≤ 10 minutes**. Every line is a spoken cue tied to a slide or
an on-screen action. Stage directions are in italics. Critical phrases to
emphasise (for the "depth of knowledge" mark) are **bold**.

## Before you hit record

- [ ] Browser A: `slides/index.html` open in Chrome, full-screen (`F`).
- [ ] Browser B: `https://greenifyrc.vercel.app` with MetaMask signed out.
- [ ] Terminal visible (for the coverage screenshot if needed).
- [ ] MetaMask wallet funded with Sepolia ETH.
- [ ] Second MetaMask account ready to switch to for the "buy" step.
- [ ] Screen recorder ready (Loom / OBS / QuickTime).
- [ ] Press `S` in the slide deck to open presenter mode on a second screen
      (optional but helpful — gives you the speaker script + timer).

---

## Timing map

| Block                 | Slide(s)     | Start | End   | Duration |
| --------------------- | ------------ | ----- | ----- | -------- |
| Intro + title         | 1            | 0:00  | 0:30  | 30s      |
| Agenda                | 2            | 0:30  | 0:50  | 20s      |
| Problem               | 3            | 0:50  | 1:30  | 40s      |
| Architecture          | 4            | 1:30  | 2:00  | 30s      |
| Stack                 | 5            | 2:00  | 2:30  | 30s      |
| Smart contracts       | 6            | 2:30  | 4:00  | 1m 30s   |
| Interaction lifecycle | 7            | 4:00  | 4:40  | 40s      |
| **LIVE DEMO**         | 8 + live app | 4:40  | 7:40  | 3m       |
| Quality + security    | 9            | 7:40  | 9:00  | 1m 20s   |
| Closing               | 10           | 9:00  | 9:40  | 40s      |
| Buffer                | —            | 9:40  | 10:00 | 20s      |

Target total: **9 minutes 40 seconds**. Under the 10-minute cap with breathing
room.

---

## The script

### Slide 1 · Cover (0:00 — 0:30)

> "Hi, I'm **Rajdeep Chaudhari**, student ID 2522821.
> This is my CN6035 Task 2 demonstration for **Greenify** — a hybrid DApp
> that moves the carbon credit ledger onto Ethereum.
>
> Over the next ten minutes I'll show you three things: **why I built it**,
> **how it's designed**, and **a live demo** of it running on the Sepolia
> testnet. Everything you'll see is open-source and deployed right now
> at `greenifyrc.vercel.app`."

_(Advance to slide 2)_

### Slide 2 · Agenda (0:30 — 0:50)

> "Here's how I've structured it. **One minute** on the problem.
> **Four minutes** on design and architecture. **Three minutes** of live
> demo so you can see it work end-to-end. Two minutes on quality and
> limitations. Let's start."

_(Advance to slide 3)_

### Slide 3 · Problem (0:50 — 1:30)

> "Carbon markets are a **$900bn industry**, according to the UNDP — but
> they run on PDFs, spreadsheets, and proprietary registries you have to
> email to audit.
>
> Three concrete failure modes: **double-counting**, where the same offset
> gets sold twice; **retirement fraud**, where burned credits quietly
> reappear; and **zero auditability**.
>
> The Guardian's 2023 investigation of Verra showed **more than 90% of
> rainforest offsets from the biggest certifier weren't real**. That's not
> a Verra problem — it's a ledger problem. Fix the ledger and these
> failures become structurally impossible."

_(Advance to slide 4)_

### Slide 4 · Architecture (1:30 — 2:00)

> "Three tiers, each with one job. A React SPA on the client, a Vercel
> serverless API in the middle, and Ethereum Sepolia plus a Mongo cache
> for state.
>
> The important property here is the **arrow direction**: events flow
> from the chain into Mongo, never the other way. **Mongo is a
> read-only mirror.** If I wipe it, the next sync rebuilds everything
> from Sepolia. The chain is always the source of truth."

_(Advance to slide 5)_

### Slide 5 · Stack (2:00 — 2:30)

> "I went deliberately boring with the stack. **OpenZeppelin 5** for the
> audited primitives — AccessControl, ERC-1155, ReentrancyGuard.
> **Hardhat** for compilation and testing. **React, Vite, ethers v6** on
> the frontend. **Vercel serverless plus MongoDB Atlas** on the backend,
> both on free tiers.
>
> Every dependency is open-source and inspectable. No proprietary SDKs,
> no black boxes."

_(Advance to slide 6)_

### Slide 6 · Smart contracts (2:30 — 4:00) _[1m 30s — longest slide]_

> "Three contracts. Each does one thing.
>
> **ProjectRegistry** is the list of environmental projects. Anyone can
> register; only a verifier role can approve. I used OpenZeppelin's
> `AccessControl` so in production that role can be rotated to a
> **Gnosis Safe multisig** — configuration change, not a rewrite.
>
> **CarbonCredit** is the ERC-1155 token. **One unit equals one tonne of
> CO₂ equivalent.** I chose ERC-1155 deliberately. ERC-20 would collapse
> every credit into one fungible pool and I'd lose per-project
> provenance. ERC-721 would make each credit a unique NFT — overkill,
> because credits inside a project **are** fungible with each other.
> ERC-1155 is the right shape: one contract, many project batches, each
> fungible internally.
>
> The function that matters most is `retire()`. It **burns** the
> caller's tokens and emits `CreditsRetired`. That event is the receipt.
> Regulators, auditors, ESG reporters — anyone — can resolve a
> retirement claim to a specific burn transaction.
>
> **Marketplace** is the escrowed listing book. Look at the `buy()`
> function on screen. Notice three things: **checks first**, **effects
> before external calls**, and **interactions last**. This is the
> textbook pattern for avoiding re-entrancy. I also apply
> `ReentrancyGuard` as belt-and-braces, because the ETH payouts use
> low-level `.call` which has no gas limit.
>
> The protocol fee is **hard-capped at 10%** — checked in the
> constructor _and_ in `setFee`. An owner can't silently raise it."

_(Advance to slide 7)_

### Slide 7 · Interaction lifecycle (4:00 — 4:40)

> "Here's the end-to-end flow of any write action.
>
> **Step 1**, the SPA builds the transaction with typed ethers bindings.
> **Step 2**, MetaMask signs — the private key never leaves the
> browser. **Step 3**, Sepolia mines, and my TxBanner shows a yellow
> pending state with the hash linked to Etherscan.
>
> **Step 4** is the crucial part: the contract emits an event. That's
> how the off-chain world finds out something happened. **Step 5**, my
> `/api/sync` serverless function polls every minute, queries logs in
> chunked ranges, and writes them to Mongo.
>
> Because every write is an **upsert keyed by the event's natural id**,
> the whole pipeline is **idempotent**. Run sync twice on the same range
> and nothing changes. That's the property that lets me wipe the DB and
> rebuild from scratch without fear."

_(Advance to slide 8)_

### Slide 8 · LIVE DEMO (4:40 — 7:40) _[3 minutes — switch to live app]_

_Switch window to Browser B (the live app, wallet disconnected)._

> "OK — live demo, on Sepolia, right now."

#### 8a · Public browse (~20s)

_Land on greenifyrc.vercel.app with no wallet connected._

> "First thing I want to show: **no wallet needed to browse**. Here's
> the landing page. Projects, listings, stats — all rendering from the
> public read API. Someone auditing a credit doesn't need to install
> MetaMask to verify it. **Public by default**."

_Click "Launch App" to go to /app._

#### 8b · Connect wallet (~15s)

_Click "Connect Wallet"._

> "Connect. MetaMask prompts to confirm the account. I'm on Sepolia.
> You can see my address in the top right. Now I can transact."

#### 8c · Register a project (~40s)

_Navigate to Registry tab. Fill the form._

> "Let me register a project. Name: **Amazon Reforestation Pilot**.
> Description. Location: Brazil. Click Register."

_Click Register. When MetaMask pops up:_

> "MetaMask shows me exactly what I'm signing. First the backend pinned
> my metadata to **IPFS via Pinata** — there's the CID. Then the
> contract call: `registerProject`."

_Click Confirm in MetaMask. Show the yellow "Mining" banner with tx
hash._

> "You can see the TxBanner at the top — it's in the **mining** state.
> That hash links straight to Etherscan. Fifteen seconds to confirm."

_Wait for confirmation; banner flips to green "Confirmed"._

#### 8d · Approve + mint 100 credits (~30s)

_Click Approve on the new project._

> "Now I'll approve it as the verifier role. Confirm in MetaMask."

_Fill in the mint fields with your own address + 100._

> "Mint 100 credits to myself. One credit equals one tonne. Confirm."

_Wait. Then navigate to Dashboard._

> "Dashboard refreshes — I now hold 100 credits against this project.
> The `CreditsIssued` event is on Etherscan."

#### 8e · List + buy + retire (~60s)

_Navigate to Market, fill the list form: projectId 0, amount 50,
price 0.001 ETH._

> "List 50 for sale at 0.001 ETH each. First approval for the
> marketplace to move my ERC-1155 tokens — this is one-time. Confirm.
> Then the list transaction itself."

_Switch to a second MetaMask account._

> "Switch to a second account. This one's never touched Greenify
> before. Buy 20 credits — confirm."

_Back to the first account. Go to Dashboard. Click Retire all._

> "Finally the most important action: **retire**. I burn the credits I
> still own. Confirm. Let me click through to Etherscan and show you
> the `CreditsRetired` event — **this is the permanent on-chain
> receipt**. Anyone auditing my offset claim can point at this
> transaction forever."

_Switch back to the slide deck._

### Slide 9 · Quality + security (7:40 — 9:00) _[1m 20s]_

> "Quality gates, because this isn't a happy-path prototype.
>
> **91% statement coverage** from 13 passing Hardhat tests. Coverage is
> in the terminal screenshot on the left. All three contracts are
> **source-verified on Etherscan** — that means the bytecode running on
> Sepolia matches the repo byte-for-byte. You see the green tick on the
> right.
>
> GitHub Actions runs **ESLint, Solhint, Prettier and the test suite**
> on every push. Husky replays the same checks as a pre-commit hook
> locally.
>
> On security: re-entrancy is handled by checks-effects-interactions
> plus ReentrancyGuard. Unauthorised minting is blocked by the
> MINTER_ROLE check. **Double-counting is structurally impossible** —
> credits are ERC-1155 tokens in a single wallet. The fee is capped.
> Secrets are encrypted environment variables. For mainnet I'd add
> **Slither** and a **Foundry invariant test suite**."

_(Advance to slide 10)_

### Slide 10 · Closing (9:00 — 9:40)

> "Honest limitations: the verifier is a single account, production
> needs a multisig. Cron is daily on the free tier, I use cron-job.org
> for finer intervals. Sepolia only for now, but the contracts are
> chain-agnostic.
>
> References are all in Harvard format — the two most important are
> the Guardian piece from 2023 that quantified the credibility problem,
> and the EIP-1155 spec by Radomski and colleagues that my token
> inherits.
>
> Thank you for watching. The code is on GitHub, the app is live, the
> contracts are verified on Etherscan. Happy to take questions."

_End recording._

---

## Mark-maximising tactics

These are the exact phrases and moments a marker is listening for. Land
them out loud.

| Marking criterion          | Say this on camera                                                                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Depth of knowledge**     | "ERC-1155 over ERC-20 or ERC-721 because…", "checks-effects-interactions", "idempotent by construction", "source-verified on Etherscan", "AccessControl is revocable".       |
| **Critical analysis**      | "Single-account verifier is fine for coursework, fatal in production", "Free-tier cron capped at daily, solved with cron-job.org", "No EIP-712 attestation yet — that's v2". |
| **Technical decisions**    | "I deliberately chose boring tech", "OpenZeppelin for audited primitives", "No proprietary SDKs".                                                                            |
| **Blockchain interaction** | Walk the 6-step lifecycle on slide 7 out loud. Show the tx hash on screen. Show the event log on Etherscan.                                                                  |
| **Harvard referencing**    | Cite at least two on camera: "the UNDP in 2022" and "Greenfield in the Guardian, 2023".                                                                                      |
| **Visual design quality**  | The deck's brutalist theme already does this. Don't over-explain it; let the visuals speak.                                                                                  |

---

## Post-recording checklist

- [ ] Length is between **8:30 and 10:00** (anything outside the window
      loses marks)
- [ ] First 10 seconds introduce **name, student ID, module code**
- [ ] Final frame shows the closing slide (Thank you)
- [ ] Upload to **MS Stream** with visibility set to the tutor's group
- [ ] Copy the Stream link into slide 1 of the deck (if you want it there)
- [ ] Submit to Moodle with the link and deck together

---

## If something goes wrong during recording

- **MetaMask doesn't pop up**: click the MetaMask extension icon manually.
  It has a queued notification.
- **Tx taking > 30s**: fast-forward or cut in post. Keep the narration
  flowing; the tutor doesn't need to watch mining bars.
- **Sync hasn't picked up**: hit `https://greenifyrc.vercel.app/api/sync`
  in a new tab before recording to warm it up.
- **Run out of time**: trim slide 5 (Stack) or the second buy-account
  step. Don't cut slide 9 (quality); that's where the marks are.
