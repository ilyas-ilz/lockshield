import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { redirectCreateSchema, redirectUpdateSchema } from "@/lib/validation/redirect";
import { Redirect } from "@/models/Redirect";
import { ADMIN_ONLY } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Redirect",
  model: Redirect,
  createSchema: redirectCreateSchema,
  updateSchema: redirectUpdateSchema,
  readRoles: ADMIN_ONLY,
  writeRoles: ADMIN_ONLY,
});
