import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

/**
 * Spins up a real, ephemeral MongoDB (mongodb-memory-server) for
 * integration tests — WHY real Mongo, not a mock: pagination (skip/limit/
 * count), unique-index enforcement, and Mongoose validators are exactly
 * the behavior worth testing, and a hand-rolled mock would just re-encode
 * assumptions about how Mongo behaves instead of verifying them.
 *
 * WHY this goes through our own connectDB(), not a bare `mongoose.connect`:
 * route handlers (and the CRUD factory) call connectDB() themselves, which
 * reads MONGODB_URI via lib/env.ts. Pointing that env var at the in-memory
 * server and calling the real connectDB() exercises the actual production
 * connection path — including its cache — instead of a parallel one that
 * would fight it for the default mongoose connection.
 */
let mongod: MongoMemoryServer | undefined;

export async function startTestDB(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.AUTH_SECRET ??= "test-secret-at-least-32-characters-long-000000";
  await connectDB();
}

export async function stopTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod?.stop();
}

export async function clearTestDB(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}
