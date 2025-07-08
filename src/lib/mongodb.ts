import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache for connection
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  const opts = {
    bufferCommands: false,
    maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    retryReads: true,
    // Production optimizations
    compressors: process.env.NODE_ENV === 'production' ? ['zlib' as 'zlib'] : undefined,
    maxIdleTimeMS: process.env.NODE_ENV === 'production' ? 120000 : undefined,
    heartbeatFrequencyMS: process.env.NODE_ENV === 'production' ? 10000 : undefined,
    keepAlive: true,
    connectTimeoutMS: 30000,
  };

  try {
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log(`MongoDB connected successfully [${process.env.NODE_ENV}]`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (process.env.NODE_ENV === 'production') {
        // In production, attempt to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect to MongoDB...');
          cached.conn = null;
          cached.promise = null;
          connectDB();
        }, 5000);
      } else {
        cached.conn = null;
        cached.promise = null;
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.log(`MongoDB disconnected [${process.env.NODE_ENV}]`);
      if (process.env.NODE_ENV === 'production') {
        // In production, attempt to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect to MongoDB...');
          cached.conn = null;
          cached.promise = null;
          connectDB();
        }, 5000);
      } else {
        cached.conn = null;
        cached.promise = null;
      }
    });

    // Handle process termination
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (err) {
          console.error('Error during MongoDB connection closure:', err);
          process.exit(1);
        }
      });
    });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    cached.promise = null;
    cached.conn = null;
    if (process.env.NODE_ENV === 'production') {
      // In production, attempt to reconnect
      setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        connectDB();
      }, 5000);
    }
    throw error;
  }
}

export default connectDB; 