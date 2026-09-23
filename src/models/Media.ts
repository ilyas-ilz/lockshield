import mongoose, { Types, type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

// WHY: a registry of every asset uploaded through the admin, so the media
// library can list/search/reuse images without listing the Spaces bucket on
// every page load, and so alt text — required for accessibility + image SEO
// — lives with the asset, not duplicated per use.
export interface IMedia extends Document {
  url: string;
  publicId?: string; // Spaces object key (or legacy Cloudinary public_id)
  storage: "local" | "spaces" | "cloudinary"; // "cloudinary" = legacy, pre-Spaces
  alt: string;
  mimeType?: string;
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
    publicId: { type: String, sparse: true, index: true },
    storage: { type: String, enum: ["local", "spaces", "cloudinary"], default: "local" },
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    mimeType: String,
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
