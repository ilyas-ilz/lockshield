import { z } from "zod";

export const redirectCreateSchema = z.object({
  from: z.string().trim().regex(/^\//, "from must start with /"),
  to: z.string().trim().min(1),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
});
export const redirectUpdateSchema = redirectCreateSchema.partial();
