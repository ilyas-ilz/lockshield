import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validation/category";
import { Category } from "@/models/Category";
import { STAFF } from "@/lib/rbac";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Category",
  model: Category,
  createSchema: categoryCreateSchema,
  updateSchema: categoryUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { name: 1 },
  searchFields: ["name"],
  sortableFields: SORTABLE_FIELDS.categories,
});
