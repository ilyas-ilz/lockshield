import mongoose, { Types, type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

// WHY: a registry of every Cloudinary asset uploaded through the admin, so
// the media library can list/search/reuse images without calling the
// Cloudinary Admin API on every page load, and so alt text — required for
// accessibility + image SEO — lives with the asset, not duplicated per use.
export interface IMedia extends Document {
  url: string;
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
mediaSchema.index({ createdAt: -1 });

export const Media: Model<IMedia> = models.Media ?? model<IMedia>("Media", mediaSchema);
