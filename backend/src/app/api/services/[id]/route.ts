import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { serviceCreateSchema, serviceUpdateSchema } from "@/lib/validation/page";
import { Service } from "@/models/Service";
import { STAFF } from "@/lib/rbac";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Service",
  model: Service,
  createSchema: serviceCreateSchema,
  updateSchema: serviceUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
});
