import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { jobCreateSchema, jobUpdateSchema } from "@/lib/validation/job";
import { Job } from "@/models/Job";
import { STAFF } from "@/lib/rbac";
import { ensureTranslationGroupId } from "@/lib/content-helpers";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Job",
  model: Job,
  createSchema: jobCreateSchema,
  updateSchema: jobUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { createdAt: -1 },
  searchFields: ["title", "department"],
  sortableFields: SORTABLE_FIELDS.jobs,
  beforeCreate: (input) => ({ translationGroupId: ensureTranslationGroupId(input.translationGroupId) }),
});
