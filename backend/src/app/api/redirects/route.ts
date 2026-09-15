import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { redirectCreateSchema, redirectUpdateSchema } from "@/lib/validation/redirect";
import { Redirect } from "@/models/Redirect";
import { ADMIN_ONLY } from "@/lib/rbac";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Redirect",
  model: Redirect,
  createSchema: redirectCreateSchema,
  updateSchema: redirectUpdateSchema,
  readRoles: ADMIN_ONLY,
  writeRoles: ADMIN_ONLY,
  defaultSort: { createdAt: -1 },
  searchFields: ["from", "to"],
  sortableFields: SORTABLE_FIELDS.redirects,
});
