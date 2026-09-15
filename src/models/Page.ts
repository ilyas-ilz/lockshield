import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { seoSchema, slugField, STATUSES, LOCALES, type ContentStatus, type Locale, ISeo } from "./shared";
import { type Block } from "@/lib/blocks/schemas";

// WHY: Home, About Us, AMC, Career landing, Projects landing — every
// "regular" page on the site — is one of these. Content is an ordered
// array of typed blocks (see lib/blocks/schemas.ts) rather than freeform
// HTML, so editors can rearrange sections without touching design/CSS.
export interface IPage extends Document {
  title: string;
  slug: string; // "about-us", "" (home — reserved slug "home"), "amc", "careers"
  blocks: Block[];
  status: ContentStatus;
  locale: Locale;
  translationGroupId: string;
  seo: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: slugField,
    blocks: { type: [Schema.Types.Mixed], default: [] },
    status: { type: String, enum: STATUSES, default: "draft" },
    locale: { type: String, enum: LOCALES, default: "en" },
    translationGroupId: { type: String, required: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);
pageSchema.index({ slug: 1, locale: 1 }, { unique: true });
pageSchema.index({ status: 1 });

export const Page: Model<IPage> = models.Page ?? model<IPage>("Page", pageSchema);
