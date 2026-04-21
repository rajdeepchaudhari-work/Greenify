export const config = {
  mongoUri: process.env.MONGO_URI ?? '',
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
  cronSecret: process.env.CRON_SECRET ?? '',
};

export function assertContractAddresses() {
  if (!config.contracts.registry || !config.contracts.credit || !config.contracts.market) {
    throw new Error('Missing REGISTRY_ADDRESS / CREDIT_ADDRESS / MARKET_ADDRESS env vars');
  }
  if (!config.rpcUrl) throw new Error('Missing SEPOLIA_RPC_URL');
}
