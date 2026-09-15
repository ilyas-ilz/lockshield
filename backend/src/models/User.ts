import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

export type UserRole = "ADMIN" | "EDITOR";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "invalid email"],
    },
    // WHY: never select the hash by default (mern-security checklist:
    // "No sensitive fields in responses") — callers must opt in with
    // .select('+passwordHash') for the one login lookup that needs it.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["ADMIN", "EDITOR"], required: true, default: "EDITOR" },
    active: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User ?? model<IUser>("User", userSchema);
