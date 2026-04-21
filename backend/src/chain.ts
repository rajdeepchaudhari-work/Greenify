import { ethers } from 'ethers';
import { config } from './config';

export const registryAbi = [
  'event ProjectRegistered(uint256 indexed id, address indexed owner, string ipfsCid)',
  'event ProjectApproved(uint256 indexed id, address indexed verifier)',
  'event CreditsIssued(uint256 indexed id, uint256 amount)',
  'function getProject(uint256 id) view returns (tuple(address owner, string ipfsCid, bool approved, uint256 totalIssued))',
];

export const marketAbi = [
  'event Listed(uint256 indexed id, address indexed seller, uint256 indexed projectId, uint256 amount, uint256 pricePerUnit)',
  'event Sold(uint256 indexed id, address indexed buyer, uint256 amount, uint256 totalPaid)',
  'event Cancelled(uint256 indexed id)',
];

export const creditAbi = [
  'event CreditsRetired(address indexed from, uint256 indexed projectId, uint256 amount)',
];

let provider: ethers.JsonRpcProvider | null = null;
export function getProvider() {
  if (!provider) {
    if (!config.rpcUrl) throw new Error('SEPOLIA_RPC_URL missing');
    provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }
  return provider;
}

export function contracts() {
  const p = getProvider();
  return {
    registry: new ethers.Contract(config.contracts.registry, registryAbi, p),
    credit: new ethers.Contract(config.contracts.credit, creditAbi, p),
    market: new ethers.Contract(config.contracts.market, marketAbi, p),
  };
}
