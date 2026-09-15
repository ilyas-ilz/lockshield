import { createItemHandlers } from "@/lib/api/createCrudHandlers";
import { postCreateSchema, postUpdateSchema } from "@/lib/validation/post";
import { Post, type IPost } from "@/models/Post";
import { STAFF } from "@/lib/rbac";
import { estimateReadingTimeMinutes } from "@/lib/content-helpers";

export const { GET, PATCH, DELETE } = createItemHandlers({
  resourceName: "Post",
  model: Post,
  createSchema: postCreateSchema,
  updateSchema: postUpdateSchema,
  readRoles: STAFF,
  writeRoles: STAFF,
  beforeUpdate: (input, existing: IPost) => {
    const extra: Record<string, unknown> = {};
    // WHY: publishedAt is stamped once, the first time status flips to
    // "published" — re-saving an already-published post must not bump its
    // publish date, or the blog list (sorted by publishedAt) would reshuffle.
    if (input.status === "published" && !existing.publishedAt) {
      extra.publishedAt = new Date();
    }
    if (input.status === "draft") {
      extra.publishedAt = null;
    }
    if (input.body) {
      extra.readingTimeMinutes = estimateReadingTimeMinutes(input.body);
    }
    return extra;
  },
});
