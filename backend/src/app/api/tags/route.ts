import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { tagCreateSchema, tagUpdateSchema } from "@/lib/validation/category";
import { Tag } from "@/models/Tag";
import { STAFF } from "@/lib/rbac";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Tag",
  model: Tag,
  createSchema: tagCreateSchema,
  updateSchema: tagUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { name: 1 },
  searchFields: ["name"],
  sortableFields: SORTABLE_FIELDS.tags,
});
