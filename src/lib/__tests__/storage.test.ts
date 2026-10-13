import { describe, it, expect, afterEach } from "vitest";
import { uploadFile, deleteStoredFile } from "../storage";
import fs from "node:fs";
import path from "node:path";

describe("Storage system (Local first fallback)", () => {
  let createdUrl: string | undefined;

  afterEach(async () => {
    if (createdUrl) {
      await deleteStoredFile({ storage: "local", url: createdUrl });
      createdUrl = undefined;
    }
  });

  it("rejects unsupported MIME types", async () => {
    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    await expect(uploadFile(file)).rejects.toThrow(/Unsupported file type/);
  });

  it("rejects files over 10MB limit", async () => {
    // Create a 11MB sparse or simulated file
    const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: "image/png" });
    const file = new File([largeBlob], "huge.png", { type: "image/png" });
    await expect(uploadFile(file)).rejects.toThrow(/exceeds maximum limit/);
  });

  it("saves valid image to local uploads directory when Cloudflare R2 is not set", async () => {
    // 1x1 transparent PNG data
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const pngBuffer = Buffer.from(pngBase64, "base64");
    const file = new File([pngBuffer], "pixel.png", { type: "image/png" });

    const result = await uploadFile(file);
    createdUrl = result.url;

    expect(result.storage).toBe("local");
    expect(result.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[a-zA-Z0-9_-]+\.png$/);
    expect(result.mimeType).toBe("image/png");
    expect(result.bytes).toBe(pngBuffer.length);

    // Verify file exists on disk
    const diskPath = path.join(process.cwd(), "public", result.url.replace(/^\//, ""));
    expect(fs.existsSync(diskPath)).toBe(true);

    // Verify deletion cleans it up
    await deleteStoredFile({ storage: "local", url: result.url });
    expect(fs.existsSync(diskPath)).toBe(false);
    createdUrl = undefined;
  });

  it("rejects SVG uploads outright (they can carry script)", async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`;
    await expect(uploadFile(new File([svg], "attack.svg", { type: "image/svg+xml" }))).rejects.toThrow(/Unsupported file type/);
  });

  it("rejects a non-image disguised as image/png", async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`;
    await expect(uploadFile(new File([svg], "pixel.png", { type: "image/png" }))).rejects.toThrow(/integrity check failed/);
  });

  it("refuses to delete a local path that escapes public/uploads", async () => {
    const victim = path.join(process.cwd(), "public", "traversal-canary.txt");
    fs.writeFileSync(victim, "keep me");
    try {
      await deleteStoredFile({ storage: "local", url: "/uploads/../traversal-canary.txt" });
      expect(fs.existsSync(victim)).toBe(true);
    } finally {
      fs.rmSync(victim, { force: true });
    }
  });
});
