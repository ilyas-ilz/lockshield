import { describe, it, expect } from "vitest";
import { safeAdminCallbackUrl } from "../safe-redirect";

describe("safeAdminCallbackUrl", () => {
  it("keeps admin paths", () => {
    expect(safeAdminCallbackUrl("/admin")).toBe("/admin");
    expect(safeAdminCallbackUrl("/admin/posts/new")).toBe("/admin/posts/new");
    expect(safeAdminCallbackUrl("/admin?tab=1")).toBe("/admin?tab=1");
  });

  it("falls back to /admin for anything off-site or outside the admin", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "javascript:alert(1)",
      "/administrator",
      "/admin.evil.test",
      "/blog",
    ]) {
      expect(safeAdminCallbackUrl(bad)).toBe("/admin");
    }
  });
});
