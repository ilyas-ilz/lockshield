import { z } from "zod";
import { slugSchema, objectIdSchema, seoInputSchema, imageInputSchema, localeSchema, statusSchema } from "./common";

// WHY: `author` is never accepted from the client — it's set server-side
// from the authenticated session (mern-security checklist: "No role/
// privilege fields accepted from req.body"; the same principle applies to
// any server-derived ownership field, not just role).
export const postCreateSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: slugSchema,
  excerpt: z.string().trim().min(1).max(300),
  body: z.unknown(),
  coverImage: imageInputSchema.optional(),
  category: objectIdSchema.optional(),
  tags: z.array(objectIdSchema).default([]),
  status: statusSchema.default("draft"),
  readingTimeMinutes: z.number().int().min(1).max(120).default(1),
  locale: localeSchema.default("en"),
  translationGroupId: z.string().optional(), // auto-generated if omitted (new post)
  seo: seoInputSchema.optional(),
});

export const postUpdateSchema = postCreateSchema.partial();

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
