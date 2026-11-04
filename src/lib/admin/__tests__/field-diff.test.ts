import { describe, it, expect } from "vitest";
import { diffFields, formatFieldValue } from "../field-diff";
import type { FieldConfig } from "../field-types";

const fields: FieldConfig[] = [
  { name: "siteName", label: "Site Name", type: "text" },
  { name: "phones", label: "Phone Numbers", type: "stringArray" },
  { name: "seo.title", label: "SEO title", type: "text" },
  { name: "active", label: "Active", type: "boolean" },
];

describe("diffFields", () => {
  it("returns nothing when values are unchanged", () => {
    const v = { siteName: "Lock Shield", phones: ["+971 4 272 7333"], seo: { title: "x" } };
    expect(diffFields(fields, v, structuredClone(v))).toEqual([]);
  });

  it("lists each changed field with its label and before/after text", () => {
    const before = { siteName: "Lock Shield", phones: ["+971 4 272 7333", "+971 54 998 5432"], seo: { title: "a" } };
    const after = { siteName: "Lock Shield", phones: ["+971 4 272 7334", "+971 54 998 5432"], seo: { title: "b" } };
    expect(diffFields(fields, before, after)).toEqual([
      {
        name: "phones",
        label: "Phone Numbers",
        before: "+971 4 272 7333, +971 54 998 5432",
        after: "+971 4 272 7334, +971 54 998 5432",
      },
      { name: "seo.title", label: "SEO title", before: "a", after: "b" },
    ]);
  });

  it("treats empty string, empty array and missing as the same (no phantom change)", () => {
    expect(diffFields(fields, { siteName: "" , phones: [] }, {})).toEqual([]);
  });

  it("formats booleans and empties readably", () => {
    expect(diffFields(fields, { active: true }, { active: false })).toEqual([
      { name: "active", label: "Active", before: "Yes", after: "No" },
    ]);
  });
});

describe("formatFieldValue", () => {
  it("shows (empty) for blank values", () => {
    expect(formatFieldValue(undefined)).toBe("(empty)");
    expect(formatFieldValue("  ")).toBe("(empty)");
    expect(formatFieldValue([])).toBe("(empty)");
  });

  it("pulls text out of rich-text JSON", () => {
    const doc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }] };
    expect(formatFieldValue(doc)).toBe("Hello");
  });

  it("truncates long values", () => {
    const out = formatFieldValue("a".repeat(500));
    expect(out.length).toBeLessThanOrEqual(201);
    expect(out.endsWith("…")).toBe(true);
  });
});
