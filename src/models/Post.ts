import mongoose, { Types, type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;
import { seoSchema, imageSchema, slugField, STATUSES, LOCALES, type ContentStatus, type Locale, ISeo } from "./shared";

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: unknown; // Tiptap JSON document
  coverImage?: { url: string; publicId?: string; alt: string; caption?: string };
  category?: Types.ObjectId;
  tags: Types.ObjectId[];
  author: Types.ObjectId;
  status: ContentStatus;
  publishedAt: Date | null;
  readingTimeMinutes: number;
  locale: Locale;
  translationGroupId: string; // shared across locale variants of "the same" post
  seo: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: slugField,
    excerpt: { type: String, required: true, trim: true, maxlength: 300 },
    body: { type: Schema.Types.Mixed, required: true },
    coverImage: { type: imageSchema },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: STATUSES, default: "draft" },
    publishedAt: { type: Date, default: null },
    readingTimeMinutes: { type: Number, default: 1 },
    locale: { type: String, enum: LOCALES, default: "en" },
    translationGroupId: { type: String, required: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// WHY: the blog list query is always "published posts, newest first" (with
// optional category/tag filter) — a compound index matching that exact
// shape means MongoDB serves pagination via index scan, not a collection
// scan + in-memory sort, which is what SSR pagination latency lives or dies on.
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ slug: 1, locale: 1 }, { unique: true });
postSchema.index({ category: 1, status: 1, publishedAt: -1 });
postSchema.index({ tags: 1, status: 1, publishedAt: -1 });
postSchema.index({ title: "text", excerpt: "text" });

export const Post: Model<IPost> = models.Post ?? model<IPost>("Post", postSchema);
