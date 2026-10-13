import { describe, expect, it } from "vitest";
import { allNavItems, flatNavGroups, isNavActive, navIconFor } from "../nav-config";

describe("isNavActive", () => {
  it("matches the dashboard only exactly", () => {
    expect(isNavActive("/admin", "/admin")).toBe(true);
    expect(isNavActive("/admin/posts", "/admin")).toBe(false);
  });
  it("matches a section and its sub-pages, not look-alike prefixes", () => {
    expect(isNavActive("/admin/posts", "/admin/posts")).toBe(true);
    expect(isNavActive("/admin/posts/new", "/admin/posts")).toBe(true);
    expect(isNavActive("/admin/postsx", "/admin/posts")).toBe(false);
  });
});

describe("flatNavGroups", () => {
  it("hides admin-only items from editors", () => {
    const hrefs = flatNavGroups(false).flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).not.toContain("/admin/users");
    expect(hrefs).not.toContain("/admin/settings");
    expect(hrefs).toContain("/admin/posts");
  });
  it("gives admins every page exactly once", () => {
    const hrefs = flatNavGroups(true).flatMap((g) => g.items.map((i) => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.sort()).toEqual(allNavItems().map((i) => i.href).sort());
  });
});

describe("navIconFor", () => {
  it("finds icons for nested and footer items", () => {
    expect(navIconFor("/admin/media")).toBeDefined();
    expect(navIconFor("/admin/settings")).toBeDefined();
    expect(navIconFor("/admin/nope")).toBeUndefined();
  });
});
