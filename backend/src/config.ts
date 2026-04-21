import * as dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/greenify',
  rpcUrl: process.env.SEPOLIA_RPC_URL ?? '',
  contracts: {
    registry: process.env.REGISTRY_ADDRESS ?? '',
    credit: process.env.CREDIT_ADDRESS ?? '',
    market: process.env.MARKET_ADDRESS ?? '',
  },
  pinata: {
    jwt: process.env.PINATA_JWT ?? '',
    gateway: process.env.PINATA_GATEWAY ?? 'https://gateway.pinata.cloud',
  },
};

export function assertContractAddresses() {
  if (!config.contracts.registry || !config.contracts.credit || !config.contracts.market) {
    throw new Error('Contract addresses missing — set REGISTRY/CREDIT/MARKET_ADDRESS in .env');
  }
  if (!config.rpcUrl) throw new Error('Missing SEPOLIA_RPC_URL');
}

export { required };
