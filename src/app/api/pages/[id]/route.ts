import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { pageCreateSchema, pageUpdateSchema } from "@/lib/validation/page";
import { Page } from "@/models/Page";
import { STAFF } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Page",
  model: Page,
  createSchema: pageCreateSchema,
  updateSchema: pageUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
});
