import { z } from "zod";
import { slugSchema, seoInputSchema, localeSchema } from "./common";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slugSchema,
  description: z.string().trim().max(300).optional(),
  locale: localeSchema.default("en"),
  seo: seoInputSchema.optional(),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1).max(50),
  slug: slugSchema,
  locale: localeSchema.default("en"),
});
export const tagUpdateSchema = tagCreateSchema.partial();
