import { PinataSDK } from 'pinata-web3';
import { config } from '../config';

let pinata: PinataSDK | null = null;

function getClient(): PinataSDK {
  if (!config.pinata.jwt) throw new Error('PINATA_JWT not configured');
  if (!pinata) {
    pinata = new PinataSDK({
      pinataJwt: config.pinata.jwt,
      pinataGateway: config.pinata.gateway,
    });
  }
  return pinata;
}

export async function pinJson(data: unknown): Promise<string> {
  const client = getClient();
  const res = await client.upload.json(data as Record<string, unknown>);
  return res.IpfsHash;
}

export async function pinFile(buffer: Buffer, name: string, mimeType: string): Promise<string> {
  const client = getClient();
  const file = new File([buffer], name, { type: mimeType });
  const res = await client.upload.file(file);
  return res.IpfsHash;
}

export function gatewayUrl(cid: string): string {
  return `${config.pinata.gateway}/ipfs/${cid}`;
}
