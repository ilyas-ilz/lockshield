import { handleApi, ok } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { hasSpaces, getEnv } from "@/lib/env";
import mongoose from "mongoose";

export async function GET() {
  return handleApi(async () => {
    await requireRole(...STAFF);

    let dbStatus = "disconnected";
    let pingMs = 0;
    try {
      const start = Date.now();
      await connectDB();
      if (mongoose.connection.readyState === 1) {
        dbStatus = "connected";
        pingMs = Date.now() - start;
      }
    } catch {
      dbStatus = "error";
    }

    const isCdn = hasSpaces();
    const env = getEnv();

    return ok({
      database: {
        status: dbStatus,
        provider: "MongoDB Atlas",
        pingMs,
        name: mongoose.connection.name || "lockshield",
      },
      storage: {
        provider: isCdn ? "DigitalOcean Spaces CDN" : "Local Disk (uploads)",
        isCdn,
      },
      system: {
        nodeVersion: process.version,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  });
}
