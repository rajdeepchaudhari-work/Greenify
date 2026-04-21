# Greenify API (Vercel Serverless Functions)

These TypeScript files are deployed by Vercel as **Node.js serverless functions** colocated with the Vite frontend. Every file is one endpoint.

## Routes

| Path                     | Method | Description                                                             |
| ------------------------ | ------ | ----------------------------------------------------------------------- |
| `/api/health`            | GET    | Liveness + Mongo connectivity probe                                     |
| `/api/projects`          | GET    | List all indexed projects (newest first, max 200)                       |
| `/api/projects/[id]`     | GET    | Get a single project by `projectId`                                     |
| `/api/projects/metadata` | POST   | Pin project metadata (+ optional image) to IPFS via Pinata, returns CID |
| `/api/listings`          | GET    | List marketplace listings (`?active=true`, `?seller=0x…`)               |
| `/api/listings/[id]`     | GET    | Get a single listing by `listingId`                                     |
| `/api/sync`              | GET    | Incremental event-log backfill: reads last-processed block, catches up  |

## How the indexer works on serverless

`setInterval` doesn't survive across serverless invocations, so the indexer runs as `/api/sync`:

- Triggered by Vercel Cron (see `vercel.json`)
- Also callable manually (e.g. from a cron-job.org monitor if you need sub-daily intervals on the free tier)
- Uses a `Meta` document in Mongo (`indexer:lastBlock`) to remember where it left off
- Scans in chunks of 45k blocks to respect the public RPC 50k `eth_getLogs` cap

## Env vars (set in Vercel project → Settings → Environment Variables)

- `MONGO_URI` — MongoDB Atlas connection string
- `SEPOLIA_RPC_URL` — HTTPS RPC (publicnode, Infura, Alchemy)
- `REGISTRY_ADDRESS`, `CREDIT_ADDRESS`, `MARKET_ADDRESS` — deployed contract addresses
- `PINATA_JWT`, `PINATA_GATEWAY` — IPFS pinning
- `CRON_SECRET` _(optional)_ — if set, `/api/sync` requires `Authorization: Bearer <secret>` or `?secret=…`. Vercel Cron will include the Authorization header automatically.

## Local dev

```bash
npm i -g vercel
cd frontend
vercel dev
# API at http://localhost:3000/api/*
# Frontend at http://localhost:3000
```

Set `VITE_API_URL=http://localhost:3000` in `.env.local` for local dev (or leave empty if you're running everything on the same origin).
