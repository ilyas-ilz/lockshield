import { describe, it, expect } from "vitest";
import { seenUntil, unseenLeadFilter } from "../leads-seen";

const NOW = new Date("2026-10-13T12:00:00.000Z");

describe("unseenLeadFilter", () => {
  it("counts every new lead when the user has never looked", () => {
    expect(unseenLeadFilter(null)).toEqual({ status: "new" });
    expect(unseenLeadFilter(undefined)).toEqual({ status: "new" });
  });

  it("counts only new leads created after the seen marker", () => {
    const seen = new Date("2026-10-13T10:00:00.000Z");
    expect(unseenLeadFilter(seen)).toEqual({ status: "new", createdAt: { $gt: seen } });
  });
});

describe("seenUntil", () => {
  it("uses the newest displayed lead time", () => {
    expect(seenUntil("2026-10-13T11:59:00.000Z", NOW)).toEqual(new Date("2026-10-13T11:59:00.000Z"));
  });

  it("falls back to now for missing or malformed input", () => {
    expect(seenUntil(undefined, NOW)).toEqual(NOW);
    expect(seenUntil("not a date", NOW)).toEqual(NOW);
    expect(seenUntil(12345, NOW)).toEqual(NOW);
  });

  it("never marks the future as seen", () => {
    expect(seenUntil("2030-01-01T00:00:00.000Z", NOW)).toEqual(NOW);
  });
});
