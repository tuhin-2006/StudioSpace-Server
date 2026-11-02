import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedConn: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;
let mongoServer: any = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  if (cachedPromise) {
    cachedConn = await cachedPromise;
    return cachedConn;
  }

  const envUri = process.env.MONGODB_URI;

  if (envUri && !envUri.includes('<username>')) {
    cachedPromise = mongoose.connect(envUri, {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false, // Fail fast if disconnected rather than hanging
    }).then((m) => {
      console.log(`[MongoDB] Connected successfully to host: ${m.connection.host}`);
      return m;
    });

    try {
      cachedConn = await cachedPromise;
      return cachedConn;
    } catch (err) {
      cachedPromise = null;
      console.error('[MongoDB] Provided MONGODB_URI failed to connect:', err);
      if (process.env.VERCEL) {
        throw err;
      }
    }
  }

  if (process.env.VERCEL) {
    throw new Error('MONGODB_URI is not configured in Vercel environment variables.');
  }

  // Local development fallback 1: Default local mongod daemon
  try {
    cachedPromise = mongoose.connect('mongodb://127.0.0.1:27017/studiospace', {
      serverSelectionTimeoutMS: 2000,
    });
    cachedConn = await cachedPromise;
    console.log(`[MongoDB] Connected to local MongoDB at: ${cachedConn.connection.host}`);
    return cachedConn;
  } catch {
    cachedPromise = null;
    console.log('[MongoDB] Local mongod daemon not found. Starting automatic in-memory MongoDB instance for local execution...');
  }

  // Local development fallback 2: In-memory MongoDB
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    cachedPromise = mongoose.connect(uri);
    cachedConn = await cachedPromise;
    console.log(`[MongoDB] In-Memory MongoDB running at: ${cachedConn.connection.host}`);

    const { seedDatabase } = await import('../scripts/seed');
    await seedDatabase();
    console.log('[MongoDB] In-Memory database auto-seeded successfully!');
    return cachedConn;
  } catch (error) {
    cachedPromise = null;
    console.error('[MongoDB] Fatal error during in-memory database initialization:', error);
    throw error;
  }
};
