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

  it("saves valid image to local uploads directory when DigitalOcean Spaces is not set", async () => {
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

  it("sanitizes malicious SVG files removing script tags and event handlers", async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert('xss')">
      <script>alert('pwned')</script>
      <circle cx="50" cy="50" r="40" onclick="alert(1)" />
      <foreignObject><iframe src="javascript:alert(1)"></iframe></foreignObject>
    </svg>`;

    const file = new File([maliciousSvg], "attack.svg", { type: "image/svg+xml" });
    const result = await uploadFile(file);
    createdUrl = result.url;

    const diskPath = path.join(process.cwd(), "public", result.url.replace(/^\//, ""));
    const savedContent = fs.readFileSync(diskPath, "utf8");

    expect(savedContent).not.toContain("<script>");
    expect(savedContent).not.toContain("onload=");
    expect(savedContent).not.toContain("onclick=");
    expect(savedContent).not.toContain("<foreignObject>");
    expect(savedContent).not.toContain("javascript:");
    expect(savedContent).toContain("<circle");

    await deleteStoredFile({ storage: "local", url: result.url });
    createdUrl = undefined;
  });
});
