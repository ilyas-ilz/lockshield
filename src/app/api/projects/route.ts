import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validation/project";
import { Project } from "@/models/Project";
import { STAFF } from "@/lib/rbac";
import { ensureTranslationGroupId } from "@/lib/content-helpers";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Project",
  model: Project,
  createSchema: projectCreateSchema,
  updateSchema: projectUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { order: 1, year: -1 },
  searchFields: ["title", "client", "summary"],
  sortableFields: SORTABLE_FIELDS.projects,
  beforeCreate: (input) => ({ translationGroupId: ensureTranslationGroupId(input.translationGroupId) }),
});
