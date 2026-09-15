import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validation/project";
import { Project } from "@/models/Project";
import { STAFF } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Project",
  model: Project,
  createSchema: projectCreateSchema,
  updateSchema: projectUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
});
