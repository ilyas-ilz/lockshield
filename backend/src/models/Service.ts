import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { seoSchema, imageSchema, slugField, STATUSES, LOCALES, type ContentStatus, type Locale, ISeo } from "./shared";
import { type Block } from "@/lib/blocks/schemas";

// WHY: the 7 service pages (fire alarm system installation, FM-200, kitchen
// suppression, DCD approval, etc.) get their own model instead of reusing
// Page, because they carry service-specific fields (icon, summary for the
// ServiceGrid block, ordering) on top of the same block-based body.
export interface IService extends Document {
  title: string;
  slug: string;
  summary: string; // shown in ServiceGrid / cards
  icon?: string; // icon identifier, e.g. an icon font class or SVG key
  coverImage?: { url: string; publicId?: string; alt: string; caption?: string };
  blocks: Block[];
  order: number;
  status: ContentStatus;
  locale: Locale;
  translationGroupId: string;
  seo: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: slugField,
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    icon: { type: String, trim: true },
    coverImage: { type: imageSchema },
    blocks: { type: [Schema.Types.Mixed], default: [] },
    order: { type: Number, default: 0 },
    status: { type: String, enum: STATUSES, default: "draft" },
    locale: { type: String, enum: LOCALES, default: "en" },
    translationGroupId: { type: String, required: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);
serviceSchema.index({ slug: 1, locale: 1 }, { unique: true });
serviceSchema.index({ status: 1, order: 1 });

export const Service: Model<IService> = models.Service ?? model<IService>("Service", serviceSchema);
