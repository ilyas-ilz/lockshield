import { describe, expect, it } from "vitest";
import { formatRelative } from "../format-relative";
import { initialsOf } from "../initials";

const now = new Date("2026-10-13T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

describe("formatRelative", () => {
  it("says just now under 45 seconds", () => {
    expect(formatRelative(ago(30_000), now)).toBe("just now");
  });
  it("uses minutes, hours, days and weeks", () => {
    expect(formatRelative(ago(5 * 60_000), now)).toBe("5 minutes ago");
    expect(formatRelative(ago(3 * 3_600_000), now)).toBe("3 hours ago");
    expect(formatRelative(ago(24 * 3_600_000), now)).toBe("yesterday");
    expect(formatRelative(ago(14 * 86_400_000), now)).toBe("2 weeks ago");
  });
  it("falls back to a date past four weeks", () => {
    expect(formatRelative(ago(60 * 86_400_000), now)).toMatch(/2026/);
  });
  it("accepts ISO strings", () => {
    expect(formatRelative(ago(5 * 60_000).toISOString(), now)).toBe("5 minutes ago");
  });
});

describe("initialsOf", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsOf("Eng salman")).toBe("ES");
    expect(initialsOf("TEST 2 - website email check")).toBe("T2");
  });
  it("splits emails and handles single words", () => {
    expect(initialsOf("sara@lockshield.ae")).toBe("SL");
    expect(initialsOf("Zt")).toBe("ZT");
  });
  it("returns ? for empty input", () => {
    expect(initialsOf("   ")).toBe("?");
  });
});
