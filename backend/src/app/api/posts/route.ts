import { createCollectionHandlers } from "@/lib/api/createCrudHandlers";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { postCreateSchema, postUpdateSchema } from "@/lib/validation/post";
import { Post } from "@/models/Post";
import { STAFF } from "@/lib/rbac";
import { ensureTranslationGroupId, estimateReadingTimeMinutes } from "@/lib/content-helpers";

export const { GET, POST } = createCollectionHandlers({
  resourceName: "Post",
  model: Post,
  createSchema: postCreateSchema,
  updateSchema: postUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  defaultSort: { createdAt: -1 },
  searchFields: ["title", "excerpt"],
  sortableFields: SORTABLE_FIELDS.posts,
  beforeCreate: (input, actor) => ({
    author: actor.id,
    translationGroupId: ensureTranslationGroupId(input.translationGroupId),
    readingTimeMinutes: input.body ? estimateReadingTimeMinutes(input.body) : input.readingTimeMinutes,
    publishedAt: input.status === "published" ? new Date() : null,
  }),
});
