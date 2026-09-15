import mongoose, { type Document, type Model } from "mongoose";
const { Schema, model, models } = mongoose;

// WHY: "Single admin + a few editors" auth model (design decision) still
// wants accountability — who changed what, when. Append-only, never
// updated/deleted through the API. Kept deliberately small (no full diff)
// to stay cheap to write on every mutation.
export interface IAuditLog extends Document {
  userId: string;
  userEmail: string;
  action: "create" | "update" | "delete" | "login_failed" | "login_success";
  resource: string; // model name, e.g. "Post"
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { type: String, enum: ["create", "update", "delete", "login_failed", "login_success"], required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    meta: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

export const AuditLog: Model<IAuditLog> = models.AuditLog ?? model<IAuditLog>("AuditLog", auditLogSchema);
