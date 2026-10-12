import { describe, it, expect } from "vitest";
import { changedKeys } from "../changed-keys";

describe("changedKeys", () => {
  const original = {
    address: { street: "Old St", locality: "Dubai" },
    defaultSeo: { title: "x".repeat(78) },
    phones: ["+971 1"],
  };

  it("returns only the top-level keys that changed", () => {
    const current = { ...original, address: { street: "New St", locality: "Dubai" } };
    expect(changedKeys(original, current)).toEqual({ address: { street: "New St", locality: "Dubai" } });
  });

  it("leaves untouched invalid values out of the payload", () => {
    const current = { ...original, phones: ["+971 1", "+971 2"] };
    expect(changedKeys(original, current)).not.toHaveProperty("defaultSeo");
  });

  it("returns an empty object when nothing changed", () => {
    expect(changedKeys(original, structuredClone(original))).toEqual({});
  });

  it("includes keys that are new in current", () => {
    expect(changedKeys({}, { footerNote: "hi" })).toEqual({ footerNote: "hi" });
  });
});
