import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectMongo } from '../_lib/mongo.js';
import { Project } from '../_lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectMongo();
    const id = Number(req.query.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Bad id' });
    const project = await Project.findOne({ projectId: id }).lean();
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(project);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
