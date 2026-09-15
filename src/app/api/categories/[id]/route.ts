import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validation/category";
import { Category } from "@/models/Category";
import { STAFF } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Category",
  model: Category,
  createSchema: categoryCreateSchema,
  updateSchema: categoryUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
});
