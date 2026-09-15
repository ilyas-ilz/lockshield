import { z } from "zod";
import { objectIdSchema } from "./common";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/models/Lead";

// WHY: this is the one schema untrusted anonymous visitors post directly
// against (contact / AMC / career forms). `status`, `ip`, `userAgent` are
// deliberately absent — those are server-set, never client-supplied.
// `honeypot` is a hidden field real browsers/users never fill; a bot that
// fills every field trips it and the submission is silently dropped
// (lib/api/leads.ts), not saved as a real lead.
export const leadCreateSchema = z.object({
  source: z.enum(LEAD_SOURCES),
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(5000).optional(),
  serviceInterest: z.string().trim().max(150).optional(),
  jobId: objectIdSchema.optional(),
  resumeUrl: z.string().optional(),
  honeypot: z.string().max(0, "bot detected").optional().default(""),
});
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

// Admin-side: only status may be changed after creation.
export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});
