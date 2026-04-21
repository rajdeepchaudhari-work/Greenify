import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Project } from '../models/Project';
import { pinJson, pinFile, gatewayUrl } from '../services/ipfs';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', async (_req, res) => {
  const projects = await Project.find().sort({ projectId: -1 }).limit(200);
  res.json(projects);
});

router.get('/:id', async (req, res) => {
  const project = await Project.findOne({ projectId: Number(req.params.id) });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

const metadataSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  location: z.string().optional(),
  methodology: z.string().optional(),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

router.post('/metadata', upload.single('image'), async (req, res) => {
  try {
    const body = metadataSchema.parse(JSON.parse(req.body.metadata));
    let imageUrl: string | undefined;
    if (req.file) {
      const cid = await pinFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      imageUrl = gatewayUrl(cid);
    }
    const cid = await pinJson({ ...body, image: imageUrl, createdAt: new Date().toISOString() });
    res.json({ cid, gateway: gatewayUrl(cid) });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
