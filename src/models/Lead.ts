import { LEAD_SOURCES, LEAD_STATUSES, type LeadSource, type LeadStatus } from "@/lib/constants";
import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

export { LEAD_SOURCES, LEAD_STATUSES, type LeadSource, type LeadStatus } from "@/lib/constants";

// WHY: every public form (contact, AMC enquiry, career application) writes
// here instead of only emailing — a submission that arrives while an inbox
// is unreachable is not lost, and admin gets a filterable/exportable pipeline.
export interface ILead extends Document {
  source: LeadSource;
  name: string;
  email?: string; // optional: quote forms are phone-first; validation requires email or phone
  phone?: string;
  message?: string;
  serviceInterest?: string; // for contact/amc: which service they asked about
  jobId?: string; // for career: which Job._id they applied to
  resumeUrl?: string; // career only; unused while CVs are sent by email
  status: LeadStatus;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema(
  {
    source: { type: String, enum: LEAD_SOURCES, required: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "invalid email"],
    },
    phone: { type: String, trim: true, maxlength: 30 },
    message: { type: String, trim: true, maxlength: 5000 },
    serviceInterest: { type: String, trim: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    resumeUrl: { type: String, trim: true },
    status: { type: String, enum: LEAD_STATUSES, default: "new" },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ source: 1, createdAt: -1 });

export const Lead: Model<ILead> = models.Lead ?? model<ILead>("Lead", leadSchema);
