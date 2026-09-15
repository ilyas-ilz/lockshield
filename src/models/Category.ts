import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { seoSchema, slugField, LOCALES, type Locale, ISeo } from "./shared";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  locale: Locale;
  seo: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: slugField,
    description: { type: String, trim: true, maxlength: 300 },
    locale: { type: String, enum: LOCALES, default: "en" },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);
categorySchema.index({ slug: 1, locale: 1 }, { unique: true });

export const Category: Model<ICategory> = models.Category ?? model<ICategory>("Category", categorySchema);
