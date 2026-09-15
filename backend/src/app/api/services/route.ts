import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { serviceCreateSchema, serviceUpdateSchema } from "@/lib/validation/page";
import { Service } from "@/models/Service";
import { STAFF } from "@/lib/rbac";
import { ensureTranslationGroupId } from "@/lib/content-helpers";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Service",
  model: Service,
  createSchema: serviceCreateSchema,
  updateSchema: serviceUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { order: 1 },
  searchFields: ["title", "summary"],
  sortableFields: SORTABLE_FIELDS.services,
  beforeCreate: (input) => ({ translationGroupId: ensureTranslationGroupId(input.translationGroupId) }),
});
