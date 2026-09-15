import mongoose from "mongoose";
const { Schema } = mongoose;

// Domain enums live in lib/constants.ts (plain data, no Mongoose) so the
// admin's client components can import them without pulling Mongoose into
// the browser bundle. Re-exported here so model files can keep importing
// from one place.
export { LOCALES, STATUSES, type Locale, type ContentStatus } from "@/lib/constants";

// TS shape for the seo subdocument — used directly on model interfaces
// (e.g. `seo: ISeo`) instead of trying to derive it from the Mongoose
// `Schema` instance below, which has no constructor/instance type to hang
// `InstanceType<>` off of.
export interface ISeo {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  focusKeyword?: string;
}

// Per-document SEO overrides. Falls back to Settings.defaultSeo /
// auto-generated values when fields are empty — see lib/seo.ts.
export const seoSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 70 },
    description: { type: String, trim: true, maxlength: 160 },
    canonical: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    noindex: { type: Boolean, default: false },
    focusKeyword: { type: String, trim: true },
  },
  { _id: false }
);

// A single Cloudinary-backed image reference used across models
// (cover images, gallery items, logos). alt is required everywhere it's
// used — enforced at the field level by callers, not here, since some
// embeds (e.g. plain logo url) don't need captions.
export const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true }, // Cloudinary public_id, for deletion/transforms
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    caption: { type: String, trim: true, maxlength: 300 },
    width: Number,
    height: Number,
  },
  { _id: false }
);

export const slugField = {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, alphanumeric, hyphen-separated"] as [RegExp, string],
};
