import { describe, it, expect, vi } from "vitest";

vi.mock("../../lib/db", () => ({ connectDB: vi.fn() }));

const { classifySource, extensionOf, rewriteBodyImages, collectBodyImages } = await import("../migrate-images-to-r2");

const R2 = "https://cdn.lockshield.ae/";

describe("classifySource", () => {
  it("skips images that are already on R2 (custom domain or r2.dev)", () => {
    expect(classifySource("https://cdn.lockshield.ae/lockshield/posts/2026/10/a.webp", R2)).toBe("r2");
    expect(classifySource("https://pub-123.r2.dev/a.webp", R2)).toBe("r2");
  });

  it("recognises every source the site has used", () => {
    expect(classifySource("/assets/images/projects/pizza-hut.webp", R2)).toBe("assets");
    expect(classifySource("/uploads/2026/09/x.png", R2)).toBe("uploads");
    expect(classifySource("https://media.sgp1.cdn.digitaloceanspaces.com/a.jpg", R2)).toBe("spaces");
    expect(classifySource("https://res.cloudinary.com/demo/image/upload/a.jpg", R2)).toBe("cloudinary");
  });

  it("leaves third-party hosts, blanks and junk alone", () => {
    expect(classifySource("https://images.unsplash.com/photo.jpg", R2)).toBe("skip");
    expect(classifySource("   ", R2)).toBe("skip");
    expect(classifySource("not a url", R2)).toBe("skip");
  });

  it("does not treat a look-alike host as R2", () => {
    expect(classifySource("https://cdn.lockshield.ae.evil.com/a.png", R2)).toBe("skip");
  });
});

describe("extensionOf", () => {
  it("reads the extension from relative and absolute URLs, ignoring query strings", () => {
    expect(extensionOf("/assets/images/a.WEBP?v=2")).toBe("webp");
    expect(extensionOf("https://res.cloudinary.com/x/a.jpeg?w=400")).toBe("jpeg");
  });
});

describe("Tiptap body images", () => {
  const body = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "hi" }] },
      { type: "image", attrs: { src: "/assets/a.png", alt: "a" } },
      { type: "bulletList", content: [{ type: "listItem", content: [{ type: "image", attrs: { src: "/uploads/b.jpg" } }] }] },
    ],
  };

  it("collects nested image srcs", () => {
    expect(collectBodyImages(body)).toEqual(["/assets/a.png", "/uploads/b.jpg"]);
  });

  it("rewrites srcs without mutating the original or touching other attrs", () => {
    const next = rewriteBodyImages(body, (src) => `https://cdn.lockshield.ae${src}`);
    expect(collectBodyImages(next)).toEqual(["https://cdn.lockshield.ae/assets/a.png", "https://cdn.lockshield.ae/uploads/b.jpg"]);
    expect((next as typeof body).content[1]).toMatchObject({ attrs: { alt: "a" } });
    expect(collectBodyImages(body)).toEqual(["/assets/a.png", "/uploads/b.jpg"]);
  });
});
