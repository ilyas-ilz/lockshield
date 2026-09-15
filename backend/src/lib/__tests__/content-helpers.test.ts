import { describe, it, expect } from "vitest";
import { ensureTranslationGroupId, estimateReadingTimeMinutes } from "../content-helpers";

describe("ensureTranslationGroupId", () => {
  it("generates a new id when none exists", () => {
    const id = ensureTranslationGroupId(undefined);
    expect(id).toBeTruthy();
    expect(id.length).toBeGreaterThan(0);
  });

  it("preserves an existing id", () => {
    expect(ensureTranslationGroupId("existing-id")).toBe("existing-id");
  });

  it("generates different ids on separate calls", () => {
    expect(ensureTranslationGroupId(undefined)).not.toBe(ensureTranslationGroupId(undefined));
  });
});

describe("estimateReadingTimeMinutes", () => {
  it("floors at 1 minute for empty/short content", () => {
    expect(estimateReadingTimeMinutes({ type: "doc", content: [] })).toBe(1);
    expect(estimateReadingTimeMinutes(null)).toBe(1);
    expect(estimateReadingTimeMinutes(undefined)).toBe(1);
  });

  it("counts words across nested text nodes", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "one two three four five" }] },
        { type: "paragraph", content: [{ type: "text", text: "six seven eight nine ten" }] },
      ],
    };
    // 10 words / 200wpm rounds to 1 minute at this length — verifies it doesn't throw and floors sanely.
    expect(estimateReadingTimeMinutes(doc)).toBe(1);
  });

  it("scales up for long content (~1000 words -> ~5 minutes)", () => {
    const word = "word ";
    const doc = { type: "doc", content: [{ type: "text", text: word.repeat(1000).trim() }] };
    expect(estimateReadingTimeMinutes(doc)).toBe(5);
  });

  it("degrades gracefully on malformed input instead of throwing", () => {
    expect(() => estimateReadingTimeMinutes("not a tiptap doc")).not.toThrow();
    expect(() => estimateReadingTimeMinutes(42)).not.toThrow();
  });
});
