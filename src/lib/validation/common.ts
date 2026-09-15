import { z } from "zod";
import { LOCALES, STATUSES } from "@/models/shared";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, alphanumeric, hyphen-separated");

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/, "invalid id");

export const seoInputSchema = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(160).optional(),
    canonical: z.string().optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().optional(),
    focusKeyword: z.string().optional(),
  })
  .partial();

export const imageInputSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  alt: z.string().min(1, "alt text is required"),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const localeSchema = z.enum(LOCALES);
export const statusSchema = z.enum(STATUSES);

export const PAGE_SIZES = [10, 20, 50, 100] as const;

/**
 * Shared list-query contract for every list endpoint:
 *   ?page=1&pageSize=20&search=&sort=createdAt&order=desc
 *
 * `limit` and `q` are accepted as aliases so older callers keep working.
 * pageSize is constrained to a fixed set — never an unbounded value, so a
 * `?pageSize=100000` can't be used to pull the whole collection.
 * `sort` is validated against a per-resource whitelist by the caller (see
 * createCrudHandlers), never passed through to Mongo raw.
 */
export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    search: z.string().trim().max(200).optional(),
    q: z.string().trim().max(200).optional(),
    sort: z.string().trim().max(50).optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .transform((v) => {
    const requested = v.pageSize ?? v.limit ?? 20;
    // Snap to the nearest allowed page size rather than rejecting — a
    // hand-edited URL should degrade to something sane, not 400.
    const pageSize = (PAGE_SIZES as readonly number[]).includes(requested) ? requested : 20;
    return {
      page: v.page,
      pageSize,
      search: v.search ?? v.q,
      sort: v.sort,
      order: v.order,
    };
  });

export type ListQuery = z.infer<typeof listQuerySchema>;

/** Back-compat alias — older imports referenced this name. */
export const paginationQuerySchema = listQuerySchema;
