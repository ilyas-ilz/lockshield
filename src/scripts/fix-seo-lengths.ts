/**
 * Finds SEO titles/descriptions stored in MongoDB that are longer than the
 * limits the admin enforces (title 70, description 160), and optionally
 * shortens them at a word boundary.
 *
 * WHY: values written before validation existed (e.g. by an early seed) sit
 * in the database past the limit. The admin rejects them on the next save of
 * that record, so they need one cleanup pass.
 *
 * Run:  npm run fix:seo            (dry run: lists what is too long)
 *       npm run fix:seo -- --apply (writes the shortened values)
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { Settings } from "../models/Settings";
import { Service } from "../models/Service";
import { Project } from "../models/Project";
import { Post } from "../models/Post";
import { Page } from "../models/Page";
import { Job } from "../models/Job";
import { Category } from "../models/Category";

const LIMITS = { title: 70, description: 160 } as const;
type SeoField = keyof typeof LIMITS;

/** Cuts to `max` characters, backing up to the last space so no word is split. */
export function shorten(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : clean.slice(0, max);
  return base.replace(/[\s,;:|\-–]+$/, "");
}

const TARGETS: { model: mongoose.Model<never>; path: string }[] = [
  { model: Settings as unknown as mongoose.Model<never>, path: "defaultSeo" },
  ...[Service, Project, Post, Page, Job, Category].map((m) => ({
    model: m as unknown as mongoose.Model<never>,
    path: "seo",
  })),
];

async function main() {
  const apply = process.argv.includes("--apply");
  await connectDB();
  console.log(`[fix-seo] connected to "${mongoose.connection.name}" (${apply ? "APPLY" : "dry run"})`);

  let found = 0;
  for (const { model, path } of TARGETS) {
    const tooLong = (Object.keys(LIMITS) as SeoField[]).map((field) => ({
      [`${path}.${field}`]: { $regex: `^[\\s\\S]{${LIMITS[field] + 1},}$` },
    }));
    const docs = await model.collection.find({ $or: tooLong }).toArray();

    for (const doc of docs) {
      const seo = (doc[path] ?? {}) as Partial<Record<SeoField, string>>;
      const set: Record<string, string> = {};
      for (const field of Object.keys(LIMITS) as SeoField[]) {
        const value = seo[field];
        if (typeof value === "string" && value.trim().length > LIMITS[field]) {
          const next = shorten(value, LIMITS[field]);
          set[`${path}.${field}`] = next;
          found++;
          console.log(
            `\n${model.modelName} ${String(doc._id)} ${path}.${field} (${value.trim().length} > ${LIMITS[field]})\n` +
              `  was: ${value}\n  new: ${next} (${next.length})`
          );
        }
      }
      if (apply && Object.keys(set).length > 0) {
        await model.collection.updateOne({ _id: doc._id }, { $set: set });
      }
    }
  }

  console.log(
    found === 0
      ? "\n[fix-seo] nothing too long, all good"
      : apply
        ? `\n[fix-seo] shortened ${found} value(s)`
        : `\n[fix-seo] ${found} value(s) too long. Re-run with --apply to save the "new" values, or edit them in the admin.`
  );
  await mongoose.disconnect();
}

// Only run when executed directly (tests import shorten()).
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/fix-seo-lengths.ts")) {
  main().catch(async (err) => {
    console.error("[fix-seo] failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  });
}
