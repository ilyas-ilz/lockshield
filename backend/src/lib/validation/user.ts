import { z } from "zod";

// WHY: role is only settable here — this schema is used exclusively by the
// ADMIN-only /api/users routes (see rbac.ts requireRole("ADMIN")). It is
// never merged with self-service profile updates, so a non-admin editing
// their own name can never smuggle role:"ADMIN" in the same request.
export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(10),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["ADMIN", "EDITOR"]).optional(),
  active: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10),
});

export const mediaUpdateSchema = z.object({
  alt: z.string().trim().min(1).max(200),
});
