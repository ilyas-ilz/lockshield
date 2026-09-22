import type { FilterQuery } from "mongoose";

/**
 * One implementation of "?search= becomes a Mongo filter", shared by the
 * CRUD factory, the hand-written routes and the SSR fetchers.
 *
 * WHY it was extracted: the same escape + `$or` construction existed in four
 * places (createCrudHandlers, /api/leads, and twice in admin/server-data),
 * and two routes that should have had it — /api/users and /api/media —
 * parsed `search` off the URL and then dropped it. That made the admin
 * tables disagree with themselves: loading /admin/users?search=bob filtered
 * correctly via the SSR path, but typing "bob" into the same box hit
 * /api/users and got every user back.
 */

/**
 * Escapes regex metacharacters so user input is matched literally.
 *
 * WHY it matters: `search` comes straight off the URL. Unescaped, a `.`
 * matches any character (so "a.b" silently matches "axb"), and a stray `(`
 * or `[` throws a SyntaxError that surfaces as a 500. Whitespace is escaped
 * too, which keeps multi-word queries behaving as literal substrings.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (char) => "\\" + char);
}

/**
 * Builds a case-insensitive OR-across-fields filter, or `{}` when there is
 * nothing to search on — callers can always spread the result.
 */
export function buildSearchFilter<TDoc>(
  search: string | undefined,
  fields: readonly string[] | undefined
): FilterQuery<TDoc> {
  const q = search?.trim();
  if (!q || !fields || fields.length === 0) return {};

  const regex = new RegExp(escapeRegex(q), "i");
  return { $or: fields.map((field) => ({ [field]: regex })) } as FilterQuery<TDoc>;
}
