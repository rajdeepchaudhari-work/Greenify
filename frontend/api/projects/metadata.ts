import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { z } from 'zod';
import { pinFile, pinJson, gatewayUrl } from '../_lib/ipfs.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const metadataSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  location: z.string().optional(),
  methodology: z.string().optional(),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const form = formidable({ maxFileSize: 4 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);

    const rawMeta = Array.isArray(fields.metadata) ? fields.metadata[0] : fields.metadata;
    if (!rawMeta) return res.status(400).json({ error: 'metadata field required' });
    const body = metadataSchema.parse(JSON.parse(rawMeta));

    let imageUrl: string | undefined;
    const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
    if (uploaded) {
      const buf = await fs.readFile(uploaded.filepath);
      const cid = await pinFile(
        buf,
        uploaded.originalFilename ?? 'image',
        uploaded.mimetype ?? 'application/octet-stream',
      );
      imageUrl = gatewayUrl(cid);
    }

    const cid = await pinJson({ ...body, image: imageUrl, createdAt: new Date().toISOString() });
    res.status(200).json({ cid, gateway: gatewayUrl(cid) });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
