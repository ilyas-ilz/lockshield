import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

/**
 * DigitalOcean Spaces branch of lib/storage (replaces Cloudinary). The S3
 * client is faked so no network or bucket is needed; what matters is the
 * request we build: bucket/key layout, public-read ACL, cache headers, the
 * DO endpoint, and the checksum setting Spaces needs.
 */

const { sent, clientConfigs } = vi.hoisted(() => ({
  sent: [] as Array<{ command: string; input: Record<string, unknown> }>,
  clientConfigs: [] as Array<Record<string, unknown>>,
}));

vi.mock("@aws-sdk/client-s3", () => {
  class S3Client {
    constructor(config: Record<string, unknown>) {
      clientConfigs.push(config);
    }
    async send(command: { constructor: { name: string }; input: Record<string, unknown> }) {
      sent.push({ command: command.constructor.name, input: command.input });
      return {};
    }
  }
  class PutObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }
  class DeleteObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }
  return { S3Client, PutObjectCommand, DeleteObjectCommand };
});

const CDN = "https://cdn.lockshield.ae";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

type Storage = typeof import("../storage");
type Spaces = typeof import("../spaces");
let storage: Storage;
let spaces: Spaces;

describe("storage on DigitalOcean Spaces", () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      MONGODB_URI: "mongodb://127.0.0.1:27017/test",
      AUTH_SECRET: "test-secret-at-least-32-characters-long-000000",
      DO_SPACES_KEY: "test-key",
      DO_SPACES_SECRET: "test-secret",
      DO_SPACES_BUCKET: "lockshield-media",
      DO_SPACES_REGION: "sgp1",
      DO_SPACES_CDN_URL: `${CDN}/`,
    });
    storage = await import("../storage");
    spaces = await import("../spaces");
  });
  beforeEach(() => {
    sent.length = 0;
  });

  it("uploads a public, long-cached object and returns its CDN url", async () => {
    const result = await storage.uploadFile(new File([PNG], "pixel.png", { type: "image/png" }), "lockshield/media");

    expect(sent).toHaveLength(1);
    const { command, input } = sent[0]!;
    expect(command).toBe("PutObjectCommand");
    expect(input.Bucket).toBe("lockshield-media");
    expect(input.Key).toMatch(/^lockshield\/media\/\d{4}\/\d{2}\/[\w-]+\.png$/);
    expect(input.ContentType).toBe("image/png");
    expect(input.ACL).toBe("public-read");
    expect(input.CacheControl).toContain("immutable");

    expect(result.storage).toBe("spaces");
    expect(result.publicId).toBe(input.Key);
    expect(result.url).toBe(`${CDN}/${input.Key}`);
    expect(result.bytes).toBe(PNG.length);
  });

  it("talks to the region's Spaces endpoint with the checksum mode Spaces accepts", async () => {
    await storage.uploadFile(new File([PNG], "pixel.png", { type: "image/png" }));
    const config = clientConfigs.at(-1)!;
    expect(config.endpoint).toBe("https://sgp1.digitaloceanspaces.com");
    expect(config.forcePathStyle).toBe(false);
    expect(config.requestChecksumCalculation).toBe("WHEN_REQUIRED");
    expect(config.responseChecksumValidation).toBe("WHEN_REQUIRED");
    expect(config.credentials).toEqual({ accessKeyId: "test-key", secretAccessKey: "test-secret" });
  });

  it("sanitizes an SVG before it ever reaches the bucket", async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><circle r="4"/></svg>`;
    await storage.uploadFile(new File([svg], "logo.svg", { type: "image/svg+xml" }));

    const body = String(sent[0]!.input.Body);
    expect(body).not.toContain("<script>");
    expect(body).not.toContain("onload=");
    expect(body).toContain("<circle");
    expect(sent[0]!.input.ContentType).toBe("image/svg+xml");
  });

  it("deletes the object by its key", async () => {
    await storage.deleteStoredFile({ storage: "spaces", url: `${CDN}/lockshield/media/2026/09/abc.png`, publicId: "lockshield/media/2026/09/abc.png" });
    expect(sent).toEqual([
      { command: "DeleteObjectCommand", input: { Bucket: "lockshield-media", Key: "lockshield/media/2026/09/abc.png" } },
    ]);
  });

  it("falls back to the bucket's built-in DigitalOcean CDN url when no custom CDN is set", () => {
    expect(spaces.spacesPublicUrl("a/b.png", { bucket: "lockshield-media", region: "sgp1" })).toBe(
      "https://lockshield-media.sgp1.cdn.digitaloceanspaces.com/a/b.png"
    );
  });
});
