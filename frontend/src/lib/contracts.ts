export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 11155111);
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const PUBLIC_RPC_URL =
  (import.meta.env.VITE_PUBLIC_RPC_URL as string) ?? 'https://ethereum-sepolia-rpc.publicnode.com';

export const addresses = {
  registry: import.meta.env.VITE_REGISTRY_ADDRESS as string,
  credit: import.meta.env.VITE_CREDIT_ADDRESS as string,
  market: import.meta.env.VITE_MARKET_ADDRESS as string,
};

export const registryAbi = [
  'function registerProject(string ipfsCid) returns (uint256)',
  'function approveProject(uint256 id)',
  'function getProject(uint256 id) view returns (tuple(address owner, string ipfsCid, bool approved, uint256 totalIssued))',
  'function isApproved(uint256 id) view returns (bool)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function VERIFIER_ROLE() view returns (bytes32)',
  'event ProjectRegistered(uint256 indexed id, address indexed owner, string ipfsCid)',
];

export const creditAbi = [
  'function mint(address to, uint256 projectId, uint256 amount)',
  'function retire(uint256 projectId, uint256 amount)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'event CreditsRetired(address indexed from, uint256 indexed projectId, uint256 amount)',
];

export const marketAbi = [
  'function list(uint256 projectId, uint256 amount, uint256 pricePerUnit) returns (uint256)',
  'function buy(uint256 id, uint256 amount) payable',
  'function cancel(uint256 id)',
  'function listings(uint256) view returns (address seller, uint256 projectId, uint256 amount, uint256 pricePerUnit, bool active)',
];
