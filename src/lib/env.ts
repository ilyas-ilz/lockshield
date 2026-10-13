import { z } from "zod";

/**
 * WHY: a key that is present-but-blank in .env (`R2_ACCESS_KEY_ID=`) is the
 * same thing as "not configured", but zod sees `""` and fails `.min(1)` even
 * behind `.optional()`. That turned a half-filled .env into a hard boot crash
 * — `npm run seed` could not run without dummy storage credentials. Blank
 * now collapses to undefined so the optional keys behave as intended, and
 * hasR2()/hasSmtp() keep gating the features that actually need them.
 */
const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional()
);

const optionalPort = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().positive().optional()
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional()
);

/**
 * WHY: Vercel serves www.lockshield.ae and 308-redirects the apex to it, but
 * the Vercel env still had SITE_URL=https://lockshield.ae. Every canonical,
 * og:url and sitemap <loc> then pointed at a redirect, which Search Console
 * flags. The apex is never the served host, so map it to www here; any other
 * host (localhost, preview deploys) is kept as configured.
 */
export function normalizeSiteUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed; // let zod report the invalid URL
  }
  if (url.hostname === "lockshield.ae") url.hostname = "www.lockshield.ae";
  return url.toString().replace(/\/+$/, "");
}

// WHY: fail fast at boot with a clear message instead of a cryptic
// "Cannot read properties of undefined" three layers deep at request time.
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)"),
  AUTH_URL: optionalUrl,
  // Cloudflare R2 (S3-compatible) for admin uploads. ENDPOINT is the bucket's
  // S3 API URL (https://<account-id>.r2.cloudflarestorage.com, shown in the
  // bucket's settings); the key pair comes from an R2 API token with Object
  // Read & Write on the bucket. PUBLIC_URL is the bucket's public domain - a
  // custom domain (served via Cloudflare's CDN) or its https://pub-<hash>.r2.dev
  // URL - and is required: the S3 endpoint itself is private.
  R2_ENDPOINT: optionalUrl,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_PUBLIC_URL: optionalUrl,
  SMTP_HOST: optionalString,
  SMTP_PORT: optionalPort,
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_FROM: optionalString,
  SITE_URL: z.preprocess(normalizeSiteUrl, z.string().url().default("https://www.lockshield.ae")),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Validated process.env access. Call at the top of any module that needs
 * env vars — throws once, synchronously, with every missing/invalid key
 * listed, instead of one-at-a-time surprises.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const R2_ENV_VARS = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
] as const;

export function hasR2(): boolean {
  return R2_ENV_VARS.every((name) => Boolean(process.env[name]?.trim()));
}

export function hasSmtp(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
