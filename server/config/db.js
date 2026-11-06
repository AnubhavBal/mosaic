import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const mongoUri = process.env.MONGO_URI;

  try {
    if (mongoUri && mongoUri.trim() !== '') {
      console.log('🔄 Connecting to configured MongoDB URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return;
    }
  } catch (error) {
    console.warn(`⚠️ Failed to connect to configured MONGO_URI (${error.message}). Falling back to embedded in-memory MongoDB...`);
  }

  // Fallback to embedded MongoMemoryServer for immediate zero-config testing & reliability
  try {
    console.log('🔄 Initializing embedded MongoDB server (MongoMemoryServer)...');
    memoryServer = await MongoMemoryServer.create();
    const fallbackUri = memoryServer.getUri();
    await mongoose.connect(fallbackUri);
    console.log(`✅ Embedded MongoDB connected successfully: ${fallbackUri}`);
  } catch (memError) {
    console.error('❌ Failed to connect to embedded MongoDB:', memError.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
