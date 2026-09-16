import { z } from "zod";
import { slugSchema, seoInputSchema, localeSchema, statusSchema } from "./common";

export const jobCreateSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: slugSchema,
  department: z.string().trim().min(1),
  location: z.string().trim().min(1).default("Dubai, UAE"),
  employmentType: z.enum(["Full-time", "Part-time", "Contract"]).default("Full-time"),
  // Required in the Job model; see the note on postCreateSchema.body.
  description: z.unknown().refine((v) => v !== undefined && v !== null, { message: "Required" }),
  requirements: z.array(z.string()).default([]),
  status: statusSchema.default("draft"),
  closesAt: z.coerce.date().nullable().optional(),
  locale: localeSchema.default("en"),
  translationGroupId: z.string().optional(),
  seo: seoInputSchema.optional(),
});
export const jobUpdateSchema = jobCreateSchema.partial();
