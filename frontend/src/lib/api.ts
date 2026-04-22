/**
 * Typed client for the Vercel serverless REST API (frontend/api/*).
 *
 * All endpoints are read-only except `pinProjectMetadata` which pushes
 * project metadata + optional image to IPFS through Pinata. Write actions
 * against the blockchain go directly to the contracts via ethers, NOT
 * through this client.
 */
import { API_URL } from './contracts';

function url(path: string): string {
  // When API_URL is empty (Vercel deployment), fall back to same-origin relative URLs.
  return API_URL ? `${API_URL}${path}` : path;
}

export interface ProjectRecord {
  projectId: number;
  owner: string;
  ipfsCid: string;
  approved: boolean;
  totalIssued: string;
}

export interface ListingRecord {
  listingId: number;
  seller: string;
  projectId: number;
  amount: string;
  pricePerUnit: string;
  active: boolean;
}

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const res = await fetch(url('/api/projects'));
  if (!res.ok) throw new Error(`GET projects failed: ${res.status}`);
  return res.json();
}

export async function fetchListings(): Promise<ListingRecord[]> {
  const res = await fetch(url('/api/listings?active=true'));
  if (!res.ok) throw new Error(`GET listings failed: ${res.status}`);
  return res.json();
}

export async function pinProjectMetadata(
  metadata: {
    name: string;
    description: string;
    location?: string;
    methodology?: string;
    owner: string;
  },
  image?: File,
): Promise<{ cid: string; gateway: string }> {
  const form = new FormData();
  form.append('metadata', JSON.stringify(metadata));
  if (image) form.append('image', image);
  const res = await fetch(url('/api/projects/metadata'), { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
