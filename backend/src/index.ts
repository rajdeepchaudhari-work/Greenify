import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config, assertContractAddresses } from './config';
import projectsRouter from './routes/projects';
import listingsRouter from './routes/listings';
import { startIndexer } from './indexer';

async function main() {
  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.use('/api/projects', projectsRouter);
  app.use('/api/listings', listingsRouter);

  await mongoose.connect(config.mongoUri);
  console.log('[backend] Mongo connected');

  if (config.contracts.registry && config.rpcUrl) {
    try {
      assertContractAddresses();
      startIndexer();
    } catch (e) {
      console.warn('[backend] indexer disabled:', (e as Error).message);
    }
  } else {
    console.warn('[backend] contract addresses not set — indexer disabled');
  }

  app.listen(config.port, () => {
    console.log(`[backend] listening on http://localhost:${config.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
