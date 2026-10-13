import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "./env";

let client: S3Client | undefined;

function getConfig() {
  const env = getEnv();
  if (
    !env.R2_ENDPOINT ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY ||
    !env.R2_BUCKET_NAME ||
    !env.R2_PUBLIC_URL
  ) {
    throw new Error(
      "Cloudflare R2 env vars are not set (R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL)"
    );
  }
  return {
    endpoint: env.R2_ENDPOINT.replace(/\/+$/, ""),
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET_NAME,
    publicUrl: env.R2_PUBLIC_URL,
  };
}

// WHY lazy singleton: same reason as the SMTP transporter in notify.ts -
// building it at import time would throw in every environment without
// R2 configured (local dev falls back to disk).
function getClient(): S3Client {
  if (client) return client;
  const config = getConfig();
  client = new S3Client({
    endpoint: config.endpoint,
    // WHY "auto": R2 has no AWS regions; Cloudflare documents "auto" as the
    // value the SDK should sign with.
    region: "auto",
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    // WHY WHEN_REQUIRED: since v3.729 the SDK adds CRC32 checksums to every
    // upload by default, which S3-compatible services don't all accept.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/**
 * Public URL for an object. R2's S3 endpoint is private, so objects are only
 * reachable through the bucket's public domain: a custom domain connected in
 * the R2 dashboard (e.g. https://cdn.lockshield.ae, served via Cloudflare's
 * CDN) or the bucket's https://pub-<hash>.r2.dev URL.
 */
export function r2PublicUrl(key: string, publicUrl: string): string {
  return `${publicUrl.replace(/\/+$/, "")}/${key}`;
}

/**
 * Uploads an object and returns its public CDN URL.
 * WHY no ACL: R2 has no per-object ACLs - public access is a bucket setting.
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
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return r2PublicUrl(key, config.publicUrl);
}

export async function deleteR2Object(key: string): Promise<void> {
  const config = getConfig();
  await getClient().send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
