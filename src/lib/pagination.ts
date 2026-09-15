import type { FilterQuery, Model } from "mongoose";
import { PAGE_SIZES } from "./validation/common";

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  /** @deprecated kept as an alias of pageSize for older callers */
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  sort?: string;
  order?: "asc" | "desc";
}

const MAX_PAGE_SIZE = Math.max(...PAGE_SIZES);

/**
 * Offset pagination for SSR list pages (blog, projects, admin tables).
 * WHY offset (skip/limit) over cursor here: these lists are small enough
 * (dozens–low hundreds of docs) that skip cost is negligible, and offset
 * pagination is what lets us render real `?page=N` links for every page
 * number — which crawlers and users can jump to directly. Cursor
 * pagination would be the right call past tens of thousands of docs.
 *
 * Runs count + find concurrently (Promise.all) since they're independent
 * reads against the same filter — halves latency vs awaiting sequentially.
 */
export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  opts: {
    page: number;
    pageSize?: number;
    /** @deprecated use pageSize */
    limit?: number;
    sort?: Record<string, 1 | -1>;
    select?: string;
  }
): Promise<PageResult<T>> {
  const page = Math.max(1, opts.page);
  const pageSize = Math.max(1, Math.min(MAX_PAGE_SIZE, opts.pageSize ?? opts.limit ?? 20));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    model
      .find(filter)
      .sort(opts.sort ?? { createdAt: -1 })
      .select(opts.select ?? "")
      .skip(skip)
      .limit(pageSize)
      .lean()
      .exec() as Promise<T[]>,
    model.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    page,
    pageSize,
    limit: pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Resolves a client-supplied sort field against a per-resource whitelist.
 * WHY a whitelist: `sort` comes straight off the URL. Passing it through
 * to Mongo unchecked lets anyone sort by any field — including ones that
 * aren't indexed (a trivial way to make the DB do expensive work) or that
 * shouldn't be enumerable. Anything not on the list falls back to the
 * resource's default.
 */
export function resolveSort(
  requested: string | undefined,
  order: "asc" | "desc",
  allowed: readonly string[],
  fallback: Record<string, 1 | -1>
): Record<string, 1 | -1> {
  if (!requested || !allowed.includes(requested)) return fallback;
  return { [requested]: order === "asc" ? 1 : -1 };
}
