import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectMongo } from '../_lib/mongo';
import { Project } from '../_lib/models';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await connectMongo();
    const projects = await Project.find().sort({ projectId: -1 }).limit(200).lean();
    res.status(200).json(projects);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
