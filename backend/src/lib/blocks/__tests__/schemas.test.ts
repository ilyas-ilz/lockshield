import { describe, it, expect } from "vitest";
import { blockSchema, blocksArraySchema, BLOCK_TYPES } from "../schemas";

// WHY one valid fixture per type: this is the guardrail mentioned in
// lib/admin/block-field-configs.ts — if a block's Zod schema gains/renames
// a field but the admin's BLOCK_FIELD_CONFIGS entry isn't updated to match,
// these fixtures (hand-written against the schema, same shape the admin
// form produces) still parse fine on their own; the real value is that any
// schema change failing here is a prompt to check the matching admin config.
const VALID_FIXTURES: Record<(typeof BLOCK_TYPES)[number], Record<string, unknown>> = {
  hero: { id: "1", type: "hero", heading: "Welcome" },
  serviceGrid: { id: "2", type: "serviceGrid", serviceIds: [] },
  stats: { id: "3", type: "stats", items: [{ value: "10", label: "years" }] },
  logoWall: { id: "4", type: "logoWall" },
  richText: { id: "5", type: "richText", content: { type: "doc", content: [] } },
  imageGallery: { id: "6", type: "imageGallery", images: [{ url: "https://x/1.jpg", alt: "a photo" }] },
  faq: { id: "7", type: "faq", items: [{ question: "Q?", answer: "A." }] },
  cta: { id: "8", type: "cta", heading: "Act now", primaryCta: { label: "Call", href: "/contact" } },
  testimonials: { id: "9", type: "testimonials", items: [{ quote: "Great!", author: "A Client" }] },
  contactSplit: { id: "10", type: "contactSplit" },
  jobList: { id: "11", type: "jobList" },
  projectGrid: { id: "12", type: "projectGrid" },
  videoBanner: { id: "13", type: "videoBanner", videoUrl: "https://x/video.mp4" },
  steps: { id: "14", type: "steps", items: [{ title: "Step one" }] },
};

describe("block schemas", () => {
  it("has a fixture for every declared block type", () => {
    expect(Object.keys(VALID_FIXTURES).sort()).toEqual([...BLOCK_TYPES].sort());
  });

  for (const type of BLOCK_TYPES) {
    it(`accepts a valid ${type} block`, () => {
      const result = blockSchema.safeParse(VALID_FIXTURES[type]);
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues)).toBe(true);
    });
  }

  it("rejects an unknown block type", () => {
    const result = blockSchema.safeParse({ id: "x", type: "notARealBlock" });
    expect(result.success).toBe(false);
  });

  it("rejects hero missing the required heading", () => {
    const result = blockSchema.safeParse({ id: "x", type: "hero" });
    expect(result.success).toBe(false);
  });

  it("rejects an image without alt text", () => {
    const result = blockSchema.safeParse({
      id: "x",
      type: "imageGallery",
      images: [{ url: "https://x/1.jpg" }],
    });
    expect(result.success).toBe(false);
  });

  it("parses a full ordered array of mixed block types", () => {
    const result = blocksArraySchema.safeParse([VALID_FIXTURES.hero, VALID_FIXTURES.faq, VALID_FIXTURES.cta]);
    expect(result.success).toBe(true);
  });

  it("defaults hidden to false when omitted", () => {
    const result = blockSchema.parse(VALID_FIXTURES.hero);
    expect(result.hidden).toBe(false);
  });
});
