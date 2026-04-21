import { JsonRpcProvider, Contract, ContractRunner } from 'ethers';
import { PUBLIC_RPC_URL, addresses, registryAbi, creditAbi, marketAbi } from './contracts';

let cached: JsonRpcProvider | null = null;

export function readProvider(): JsonRpcProvider {
  if (!cached) cached = new JsonRpcProvider(PUBLIC_RPC_URL);
  return cached;
}

export function readContracts(runner?: ContractRunner) {
  const p = runner ?? readProvider();
  return {
    registry: new Contract(addresses.registry, registryAbi, p),
    credit: new Contract(addresses.credit, creditAbi, p),
    market: new Contract(addresses.market, marketAbi, p),
  };
}
