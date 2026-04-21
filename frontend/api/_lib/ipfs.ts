import { PinataSDK } from 'pinata-web3';
import { config } from './config.js';

let client: PinataSDK | null = null;

function getClient(): PinataSDK {
  if (!config.pinata.jwt) throw new Error('PINATA_JWT not configured');
  if (!client) {
    client = new PinataSDK({
      pinataJwt: config.pinata.jwt,
      pinataGateway: config.pinata.gateway,
    });
  }
  return client;
}

export async function pinJson(data: unknown): Promise<string> {
  const res = await getClient().upload.json(data as Record<string, unknown>);
  return res.IpfsHash;
}

export async function pinFile(buffer: Buffer, name: string, mimeType: string): Promise<string> {
  const file = new File([new Uint8Array(buffer)], name, { type: mimeType });
  const res = await getClient().upload.file(file);
  return res.IpfsHash;
}

export function gatewayUrl(cid: string): string {
  return `${config.pinata.gateway}/ipfs/${cid}`;
}
