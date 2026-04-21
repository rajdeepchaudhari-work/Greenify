import { Contract, JsonRpcProvider, WebSocketProvider, type Provider } from 'ethers';
import { config } from './config';

export const registryAbi = [
  'event ProjectRegistered(uint256 indexed id, address indexed owner, string ipfsCid)',
  'event ProjectApproved(uint256 indexed id, address indexed verifier)',
  'event CreditsIssued(uint256 indexed id, uint256 amount)',
];

export const marketAbi = [
  'event Listed(uint256 indexed id, address indexed seller, uint256 indexed projectId, uint256 amount, uint256 pricePerUnit)',
  'event Sold(uint256 indexed id, address indexed buyer, uint256 amount, uint256 totalPaid)',
  'event Cancelled(uint256 indexed id)',
];

export const creditAbi = [
  'event CreditsRetired(address indexed from, uint256 indexed projectId, uint256 amount)',
];

let cached: Provider | null = null;

export function getProvider(): Provider {
  if (cached) return cached;
  if (!config.rpcUrl) throw new Error('SEPOLIA_RPC_URL missing');
  // Serverless can't hold WebSocket subscriptions across invocations — always prefer HTTPS.
  const url = config.rpcUrl.replace(/^wss?:\/\//, 'https://');
  cached = url.startsWith('wss') ? new WebSocketProvider(url) : new JsonRpcProvider(url);
  return cached;
}

export function contracts() {
  const p = getProvider();
  return {
    registry: new Contract(config.contracts.registry, registryAbi, p),
    credit: new Contract(config.contracts.credit, creditAbi, p),
    market: new Contract(config.contracts.market, marketAbi, p),
  };
}
