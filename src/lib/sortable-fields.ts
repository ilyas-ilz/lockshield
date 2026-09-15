/**
 * Per-resource sort whitelists — the single source of truth shared by the
 * API routes (which reject anything not listed, see resolveSort) and the
 * admin table headers (which only render a sort control for listed
 * fields). Keeping one map means a column can never be clickable in the
 * UI but rejected by the server, or vice versa.
 *
 * Only add fields that are indexed or cheap to sort — an unindexed sort
 * on a large collection is a self-inflicted performance problem.
 */
export const SORTABLE_FIELDS = {
  posts: ["createdAt", "updatedAt", "title", "publishedAt", "status"],
  categories: ["createdAt", "name", "slug"],
  tags: ["createdAt", "name", "slug"],
  pages: ["createdAt", "updatedAt", "title", "slug", "status"],
  services: ["createdAt", "updatedAt", "title", "order", "status"],
  projects: ["createdAt", "updatedAt", "title", "client", "year", "order", "sector", "publishStatus"],
  jobs: ["createdAt", "updatedAt", "title", "department", "status"],
  redirects: ["createdAt", "from", "to", "hits"],
  media: ["createdAt", "alt"],
  users: ["createdAt", "name", "email", "role"],
  leads: ["createdAt", "name", "status", "source"],
} as const satisfies Record<string, readonly string[]>;

export type SortableResource = keyof typeof SORTABLE_FIELDS;
