import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

/**
 * Cloudflare R2 branch of lib/storage (replaces DigitalOcean Spaces). The S3
 * client is faked so no network or bucket is needed; what matters is the
 * request we build: bucket/key layout, no ACL (R2 has none), cache headers,
 * the account endpoint, and the "auto" signing region.
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
type R2 = typeof import("../r2");
let storage: Storage;
let r2: R2;

describe("storage on Cloudflare R2", () => {
  beforeAll(async () => {
    Object.assign(process.env, {
      MONGODB_URI: "mongodb://127.0.0.1:27017/test",
      AUTH_SECRET: "test-secret-at-least-32-characters-long-000000",
      R2_ENDPOINT: "https://abc123account.r2.cloudflarestorage.com/",
      R2_ACCESS_KEY_ID: "test-key",
      R2_SECRET_ACCESS_KEY: "test-secret",
      R2_BUCKET_NAME: "lockshield-media",
      R2_PUBLIC_URL: `${CDN}/`,
    });
    storage = await import("../storage");
    r2 = await import("../r2");
  });
  beforeEach(() => {
    sent.length = 0;
  });

  it("uploads a long-cached object and returns its CDN url", async () => {
    const result = await storage.uploadFile(new File([PNG], "pixel.png", { type: "image/png" }), "lockshield/media");

    expect(sent).toHaveLength(1);
    const { command, input } = sent[0]!;
    expect(command).toBe("PutObjectCommand");
    expect(input.Bucket).toBe("lockshield-media");
    expect(input.Key).toMatch(/^lockshield\/media\/\d{4}\/\d{2}\/[\w-]+\.png$/);
    expect(input.ContentType).toBe("image/png");
    expect(input).not.toHaveProperty("ACL");
    expect(input.CacheControl).toContain("immutable");

    expect(result.storage).toBe("r2");
    expect(result.publicId).toBe(input.Key);
    expect(result.url).toBe(`${CDN}/${input.Key}`);
    expect(result.bytes).toBe(PNG.length);
  });

  it("talks to the configured R2 endpoint with the auto region", async () => {
    await storage.uploadFile(new File([PNG], "pixel.png", { type: "image/png" }));
    const config = clientConfigs.at(-1)!;
    expect(config.endpoint).toBe("https://abc123account.r2.cloudflarestorage.com");
    expect(config.region).toBe("auto");
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
    await storage.deleteStoredFile({ storage: "r2", url: `${CDN}/lockshield/media/2026/09/abc.png`, publicId: "lockshield/media/2026/09/abc.png" });
    expect(sent).toEqual([
      { command: "DeleteObjectCommand", input: { Bucket: "lockshield-media", Key: "lockshield/media/2026/09/abc.png" } },
    ]);
  });

  it("only removes the registry entry for legacy Spaces uploads", async () => {
    await storage.deleteStoredFile({ storage: "spaces", url: "https://old.sgp1.cdn.digitaloceanspaces.com/a.png", publicId: "a.png" });
    expect(sent).toEqual([]);
  });

  it("joins the public URL and key without a double slash", () => {
    expect(r2.r2PublicUrl("a/b.png", "https://pub-123.r2.dev/")).toBe("https://pub-123.r2.dev/a/b.png");
  });
});
