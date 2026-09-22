import mongoose from "mongoose";
import { getEnv } from "./env";

// WHY: serverless functions (Vercel) can spin up many concurrent instances,
// and each hot module reload in dev re-runs this file. Without a cached
// connection on `global`, every request opens a fresh connection and Atlas
// rejects the rest once the pool limit is hit. Caching on `globalThis`
// survives HMR in dev and is per-instance (safe) in serverless prod.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const { MONGODB_URI } = getEnv();
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      // WHY: without this the driver retries server selection for 30s
      // (default) before throwing. With local Mongo stopped, every public
      // page stalled ~30s before falling back to defaults. 5s keeps the
      // fallback path usable in dev while staying generous for Atlas cold
      // starts in production.
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // WHY: don't cache a failed connection attempt
    throw err;
  }

  return cache.conn;
}
