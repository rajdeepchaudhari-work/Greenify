import mongoose from 'mongoose';
import { config } from './config.js';

declare global {
  // eslint-disable-next-line no-var
  var _mongoPromise: Promise<typeof mongoose> | undefined;
}

export async function connectMongo() {
  if (!config.mongoUri) throw new Error('MONGO_URI not set');
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!global._mongoPromise) {
    global._mongoPromise = mongoose.connect(config.mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }
  await global._mongoPromise;
  return mongoose;
}
