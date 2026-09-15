import { z } from "zod";
import { slugSchema, seoInputSchema, localeSchema, statusSchema } from "./common";
import { blocksArraySchema } from "@/lib/blocks/schemas";

export const pageCreateSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: slugSchema,
  blocks: blocksArraySchema.default([]),
  status: statusSchema.default("draft"),
  locale: localeSchema.default("en"),
  translationGroupId: z.string().optional(),
  seo: seoInputSchema.optional(),
});
export const pageUpdateSchema = pageCreateSchema.partial();

export const serviceCreateSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: slugSchema,
  summary: z.string().trim().min(1).max(300),
  icon: z.string().optional(),
  coverImage: z
    .object({ url: z.string().min(1), publicId: z.string().optional(), alt: z.string().min(1), caption: z.string().optional() })
    .optional(),
  blocks: blocksArraySchema.default([]),
  order: z.number().int().default(0),
  status: statusSchema.default("draft"),
  locale: localeSchema.default("en"),
  translationGroupId: z.string().optional(),
  seo: seoInputSchema.optional(),
});
export const serviceUpdateSchema = serviceCreateSchema.partial();
