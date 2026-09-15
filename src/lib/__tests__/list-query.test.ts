import { describe, it, expect } from "vitest";
import { listQuerySchema } from "../validation/common";
import { resolveSort } from "../pagination";

describe("listQuerySchema", () => {
  it("applies sane defaults for an empty query", () => {
    const q = listQuerySchema.parse({});
    expect(q).toEqual({ page: 1, pageSize: 20, search: undefined, sort: undefined, order: "desc" });
  });

  it("accepts the documented param names", () => {
    const q = listQuerySchema.parse({ page: "3", pageSize: "50", search: "alarm", sort: "title", order: "asc" });
    expect(q).toEqual({ page: 3, pageSize: 50, search: "alarm", sort: "title", order: "asc" });
  });

  it("accepts limit/q as aliases so older callers keep working", () => {
    const q = listQuerySchema.parse({ limit: "10", q: "pump" });
    expect(q.pageSize).toBe(10);
    expect(q.search).toBe("pump");
  });

  it("prefers pageSize/search when both forms are present", () => {
    const q = listQuerySchema.parse({ pageSize: "50", limit: "10", search: "a", q: "b" });
    expect(q.pageSize).toBe(50);
    expect(q.search).toBe("a");
  });

  it("snaps an unsupported page size back to the default rather than rejecting", () => {
    expect(listQuerySchema.parse({ pageSize: "37" }).pageSize).toBe(20);
    expect(listQuerySchema.parse({ pageSize: "99999" }).pageSize).toBe(20);
  });

  it("rejects a page below 1", () => {
    expect(listQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ page: "-4" }).success).toBe(false);
  });

  it("rejects an unknown sort order", () => {
    expect(listQuerySchema.safeParse({ order: "sideways" }).success).toBe(false);
  });
});

describe("resolveSort", () => {
  const allowed = ["createdAt", "title"] as const;
  const fallback = { createdAt: -1 as const };

  it("uses the requested field when it's whitelisted", () => {
    expect(resolveSort("title", "asc", allowed, fallback)).toEqual({ title: 1 });
    expect(resolveSort("title", "desc", allowed, fallback)).toEqual({ title: -1 });
  });

  it("falls back when the field is not whitelisted", () => {
    // WHY this matters: `sort` comes straight off the URL, so an
    // un-whitelisted field must never reach Mongo.
    expect(resolveSort("passwordHash", "asc", allowed, fallback)).toEqual(fallback);
    expect(resolveSort("$where", "asc", allowed, fallback)).toEqual(fallback);
  });

  it("falls back when no sort is requested", () => {
    expect(resolveSort(undefined, "desc", allowed, fallback)).toEqual(fallback);
  });
});
