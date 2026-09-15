import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { jobCreateSchema, jobUpdateSchema } from "@/lib/validation/job";
import { Job } from "@/models/Job";
import { STAFF } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Job",
  model: Job,
  createSchema: jobCreateSchema,
  updateSchema: jobUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
});
