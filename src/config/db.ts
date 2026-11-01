import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer: any = null;

export const connectDB = async (): Promise<void> => {
  const envUri = process.env.MONGODB_URI;

  if (envUri && !envUri.includes('<username>')) {
    try {
      const conn = await mongoose.connect(envUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn('[MongoDB] Provided MONGODB_URI failed to connect:', err);
    }
  }

  // Try default local URI
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/studiospace', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to local MongoDB at: ${conn.connection.host}`);
    return;
  } catch {
    console.log('[MongoDB] Local mongod daemon not found. Starting automatic in-memory MongoDB instance for local execution...');
  }

  // Graceful fallback to mongodb-memory-server for zero-setup local execution
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] In-Memory MongoDB running at: ${conn.connection.host}`);

    // Auto-seed in-memory database with the 8 realistic creative workspaces
    const { seedDatabase } = await import('../scripts/seed');
    await seedDatabase();
    console.log('[MongoDB] In-Memory database auto-seeded successfully!');
  } catch (error) {
    console.error('[MongoDB] Fatal error during in-memory database initialization:', error);
  }
};
