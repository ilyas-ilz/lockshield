import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IRedirect extends Document {
  from: string; // path, e.g. "/blog/old-post.html" — must start with "/"
  to: string; // absolute path or full URL
  statusCode: 301 | 302;
  hits: number;
  lastHitAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const redirectSchema = new Schema(
  {
    from: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\//, "from must be a path starting with /"],
    },
    to: { type: String, required: true, trim: true },
    statusCode: { type: Number, enum: [301, 302], default: 301 },
    hits: { type: Number, default: 0 },
    lastHitAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Redirect: Model<IRedirect> = models.Redirect ?? model<IRedirect>("Redirect", redirectSchema);
