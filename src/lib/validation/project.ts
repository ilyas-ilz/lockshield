import { z } from "zod";
import { slugSchema, seoInputSchema, imageInputSchema, localeSchema, statusSchema } from "./common";
import { PROJECT_SECTORS, EMIRATES, SCOPE_TAGS } from "@/models/Project";

export const projectCreateSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: slugSchema,
  client: z.string().trim().min(1).max(150),
  clientLogo: imageInputSchema.optional(),
  sector: z.enum(PROJECT_SECTORS),
  emirate: z.enum(EMIRATES),
  area: z.string().trim().optional(),
  year: z.number().int().min(2000).max(2100),
  status: z.enum(["Completed", "Ongoing"]).default("Completed"),
  scopeOfWork: z.array(z.enum(SCOPE_TAGS)).default([]),
  summary: z.string().trim().min(1).max(300),
  body: z.unknown().optional(),
  coverImage: imageInputSchema,
  gallery: z.array(imageInputSchema).default([]),
  stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  publishStatus: statusSchema.default("draft"),
  locale: localeSchema.default("en"),
  translationGroupId: z.string().optional(),
  seo: seoInputSchema.optional(),
});
export const projectUpdateSchema = projectCreateSchema.partial();
