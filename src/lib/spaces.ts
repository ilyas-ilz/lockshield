import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "./env";

interface SpacesLocation {
  bucket: string;
  region: string;
  cdnUrl?: string;
}

let client: S3Client | undefined;

function getConfig() {
  const env = getEnv();
  if (!env.DO_SPACES_KEY || !env.DO_SPACES_SECRET || !env.DO_SPACES_BUCKET || !env.DO_SPACES_REGION) {
    throw new Error("DigitalOcean Spaces env vars are not set (DO_SPACES_KEY / _SECRET / _BUCKET / _REGION)");
  }
  return {
    key: env.DO_SPACES_KEY,
    secret: env.DO_SPACES_SECRET,
    bucket: env.DO_SPACES_BUCKET,
    region: env.DO_SPACES_REGION,
    cdnUrl: env.DO_SPACES_CDN_URL,
  };
}

// WHY lazy singleton: same reason as the SMTP transporter in notify.ts -
// building it at import time would throw in every environment without
// Spaces configured (local dev falls back to disk).
function getClient(): S3Client {
  if (client) return client;
  const config = getConfig();
  client = new S3Client({
    endpoint: `https://${config.region}.digitaloceanspaces.com`,
    // WHY a fixed AWS region: Spaces routes by endpoint; the SDK still needs
    // a syntactically valid region to sign requests. DO documents us-east-1.
    region: "us-east-1",
    forcePathStyle: false,
    credentials: { accessKeyId: config.key, secretAccessKey: config.secret },
    // WHY WHEN_REQUIRED: since v3.729 the SDK adds CRC32 checksums to every
    // upload by default, which S3-compatible services like Spaces may reject.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** Public URL for an object: the custom CDN domain if set, else the bucket's DO CDN endpoint. */
export function spacesPublicUrl(key: string, location: SpacesLocation): string {
  const base = location.cdnUrl
    ? location.cdnUrl.replace(/\/+$/, "")
    : `https://${location.bucket}.${location.region}.cdn.digitaloceanspaces.com`;
  return `${base}/${key}`;
}

/**
 * Uploads a publicly readable object and returns its CDN URL.
 * WHY immutable caching: keys are random per upload (never overwritten), so
 * the CDN and browsers can cache them for a year without going stale.
 */
export async function putPublicObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const config = getConfig();
  await getClient().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return spacesPublicUrl(key, config);
}

export async function deleteSpacesObject(key: string): Promise<void> {
  const config = getConfig();
  await getClient().send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
