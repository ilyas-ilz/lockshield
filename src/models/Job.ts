import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { seoSchema, slugField, STATUSES, LOCALES, type ContentStatus, type Locale, ISeo } from "./shared";

export interface IJob extends Document {
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  description: unknown; // Tiptap JSON
  requirements: string[];
  status: ContentStatus;
  closesAt: Date | null;
  locale: Locale;
  translationGroupId: string;
  seo: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: slugField,
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, default: "Dubai, UAE" },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract"], default: "Full-time" },
    description: { type: Schema.Types.Mixed, required: true },
    requirements: { type: [String], default: [] },
    status: { type: String, enum: STATUSES, default: "draft" },
    closesAt: { type: Date, default: null },
    locale: { type: String, enum: LOCALES, default: "en" },
    translationGroupId: { type: String, required: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);
jobSchema.index({ slug: 1, locale: 1 }, { unique: true });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job: Model<IJob> = models.Job ?? model<IJob>("Job", jobSchema);
