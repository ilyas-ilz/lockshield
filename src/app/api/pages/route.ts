import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { pageCreateSchema, pageUpdateSchema } from "@/lib/validation/page";
import { Page } from "@/models/Page";
import { STAFF } from "@/lib/rbac";
import { ensureTranslationGroupId } from "@/lib/content-helpers";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Page",
  model: Page,
  createSchema: pageCreateSchema,
  updateSchema: pageUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { title: 1 },
  searchFields: ["title"],
  sortableFields: SORTABLE_FIELDS.pages,
  beforeCreate: (input) => ({ translationGroupId: ensureTranslationGroupId(input.translationGroupId) }),
});
