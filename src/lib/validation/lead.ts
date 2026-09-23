import { z } from "zod";
import { objectIdSchema } from "./common";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/models/Lead";

// WHY: this is the one schema untrusted anonymous visitors post directly
// against (contact / AMC / career forms). `status`, `ip`, `userAgent` are
// deliberately absent — those are server-set, never client-supplied.
// `honeypot` is a hidden field real browsers/users never fill; a bot that
// fills every field trips it and the submission is silently dropped
// (lib/api/leads.ts), not saved as a real lead.
//
// WHY email is optional: the quote forms are phone-first (UAE visitors often
// skip email), and a required email silently lost every phone-only quote
// request with a 400. At least one way to reach the visitor is still required.
const blankToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

export const leadCreateSchema = z
  .object({
    source: z.enum(LEAD_SOURCES),
    name: z.string().trim().min(1).max(150),
    email: z.preprocess(blankToUndefined, z.string().trim().email().max(200).optional()),
    phone: z.preprocess(blankToUndefined, z.string().trim().max(30).optional()),
    message: z.string().trim().max(5000).optional(),
    serviceInterest: z.string().trim().max(150).optional(),
    jobId: objectIdSchema.optional(),
    resumeUrl: z.string().optional(),
    // WHY no max(0): rejecting a filled honeypot here returned 400 "bot
    // detected" and taught the bot to adapt. Accept it; the route drops it
    // with a fake success instead.
    honeypot: z.string().max(500).optional().default(""),
  })
  .refine((lead) => Boolean(lead.email || lead.phone), {
    message: "Provide a phone number or email address",
    path: ["phone"],
  });
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

// Admin-side: only status may be changed after creation.
export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});
