import { describe, it, expect, vi } from "vitest";

vi.mock("../../lib/db", () => ({ connectDB: vi.fn() }));

const { shorten } = await import("../fix-seo-lengths");

describe("shorten", () => {
  it("leaves values within the limit unchanged (trimmed)", () => {
    expect(shorten("  Lock Shield  ", 70)).toBe("Lock Shield");
  });

  it("cuts at a word boundary and stays within the limit", () => {
    const long = "Lock Shield | Fire Protection & Safety Systems Installation Company, Dubai UAE";
    const out = shorten(long, 70);
    expect(out.length).toBeLessThanOrEqual(70);
    expect(long.startsWith(out)).toBe(true);
    expect(out.endsWith(" ")).toBe(false);
    expect(out).not.toMatch(/[,|]$/);
  });

  it("hard-cuts a single long word", () => {
    expect(shorten("x".repeat(100), 70)).toHaveLength(70);
  });
});
