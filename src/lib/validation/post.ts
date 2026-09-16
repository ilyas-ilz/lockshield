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
  // WHY refined rather than a bare z.unknown(): Zod treats unknown as
  // optional, but Post.body is `required: true` in Mongoose - so omitting it
  // sailed past this boundary and died in the driver as an opaque 500
  // instead of a 400 naming the field.
  body: z.unknown().refine((v) => v !== undefined && v !== null, { message: "Required" }),
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
