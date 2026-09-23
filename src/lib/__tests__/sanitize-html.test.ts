import { describe, it, expect } from "vitest";
import { sanitizeRichHtml } from "../sanitize-html";
import { postCreateSchema, postUpdateSchema } from "../validation/post";

describe("sanitizeRichHtml", () => {
  it("strips script tags and their contents", () => {
    expect(sanitizeRichHtml("<p>Hi</p><script>alert(1)</script>")).toBe("<p>Hi</p>");
  });

  it("strips inline event handlers", () => {
    const out = sanitizeRichHtml('<img src="https://x.test/a.png" onerror="alert(1)"><p onclick="x()">t</p>');
    expect(out).not.toMatch(/onerror|onclick/);
    expect(out).toContain('src="https://x.test/a.png"');
  });

  it("drops javascript: and protocol-relative links", () => {
    expect(sanitizeRichHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
    expect(sanitizeRichHtml('<a href="//evil.test">x</a>')).not.toContain("evil.test");
  });

  it("removes iframes, styles and forms", () => {
    const out = sanitizeRichHtml('<iframe src="https://evil.test"></iframe><style>*{}</style><form><input></form><p>ok</p>');
    expect(out).toBe("<p>ok</p>");
  });

  it("keeps the editor's formatting and forces rel=noopener on links", () => {
    const out = sanitizeRichHtml(
      '<h2>Title</h2><p><strong>b</strong> <em>i</em></p><ul><li>one</li></ul><a href="https://lockshield.ae" target="_blank">site</a>'
    );
    expect(out).toContain("<h2>Title</h2>");
    expect(out).toContain("<strong>b</strong>");
    expect(out).toContain("<ul><li>one</li></ul>");
    expect(out).toContain('href="https://lockshield.ae"');
    expect(out).toContain('rel="noopener noreferrer"');
  });
});

describe("post schema body", () => {
  const base = { title: "T", slug: "t", excerpt: "E" };

  it("sanitizes an HTML string body on create and update", () => {
    const created = postCreateSchema.parse({ ...base, body: "<p>x</p><script>alert(1)</script>" });
    expect(created.body).toBe("<p>x</p>");
    const updated = postUpdateSchema.parse({ body: '<p onmouseover="x()">y</p>' });
    expect(updated.body).toBe("<p>y</p>");
  });

  it("passes Tiptap JSON through untouched", () => {
    const doc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }] };
    expect(postCreateSchema.parse({ ...base, body: doc }).body).toEqual(doc);
  });
});
