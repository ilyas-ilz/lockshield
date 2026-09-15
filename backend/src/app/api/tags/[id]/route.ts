import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { tagCreateSchema, tagUpdateSchema } from "@/lib/validation/category";
import { Tag } from "@/models/Tag";
import { STAFF } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Tag",
  model: Tag,
  createSchema: tagCreateSchema,
  updateSchema: tagUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
});
