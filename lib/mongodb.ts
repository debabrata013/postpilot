// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI");

console.log('MongoDB URI:', MONGODB_URI); // Debug log

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: any, promise: Promise<any> | null } | undefined;
}

let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    console.log('Connecting to MongoDB...'); // Debug log
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB Connected Successfully'); // Debug log
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB Connection Error:', error); // Debug log
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
