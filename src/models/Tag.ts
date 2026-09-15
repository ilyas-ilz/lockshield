import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { slugField, LOCALES, type Locale } from "./shared";

export interface ITag extends Document {
  name: string;
  slug: string;
  locale: Locale;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    slug: slugField,
    locale: { type: String, enum: LOCALES, default: "en" },
  },
  { timestamps: true }
);
tagSchema.index({ slug: 1, locale: 1 }, { unique: true });

export const Tag: Model<ITag> = models.Tag ?? model<ITag>("Tag", tagSchema);
