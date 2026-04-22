/**
 * MongoDB connection helper, serverless-friendly.
 *
 * Caches the Mongoose connection promise on `global` so warm serverless
 * invocations reuse the existing pool instead of creating a new socket
 * on every cold start. Without this, a single serverless function would
 * open a new connection per request and exhaust Atlas's free-tier
 * connection budget (500).
 */
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
