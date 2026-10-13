import { handleApi, ok } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { hasR2, hasSmtp, getEnv } from "@/lib/env";
import { checkR2Bucket } from "@/lib/r2";
import { leadRecipients, verifySmtp } from "@/lib/notify";
import { runHealthChecks } from "@/lib/health";
import mongoose from "mongoose";

// WHY no caching: the Refresh button must re-run every probe.
export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    await requireRole(...STAFF);

    const env = getEnv();
    const report = await runHealthChecks(
      {
        database: async () => {
          await connectDB();
          await mongoose.connection.db!.admin().ping();
        },
        storage: checkR2Bucket,
        email: verifySmtp,
      },
      {
        r2Configured: hasR2(),
        smtpConfigured: hasSmtp(),
        recipients: leadRecipients(env),
        production: env.NODE_ENV === "production",
        timeoutMs: 8000,
      }
    );

    return ok({
      ...report,
      technical: {
        ...report.technical,
        database: {
          ...report.technical.database,
          provider: env.MONGODB_URI.includes(".mongodb.net") ? "MongoDB Atlas" : "MongoDB",
          name: mongoose.connection.name || null,
        },
        storage: {
          ...report.technical.storage,
          provider: hasR2() ? "Cloudflare R2" : "Local disk (public/uploads)",
          bucket: env.R2_BUCKET_NAME ?? null,
        },
        runtime: {
          nodeVersion: process.version,
          environment: env.NODE_ENV,
          deployment: process.env.VERCEL_ENV ?? "local",
        },
      },
    });
  });
}
