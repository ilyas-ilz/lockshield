import { z } from "zod";

/**
 * WHY: a key that is present-but-blank in .env (`CLOUDINARY_API_KEY=`) is the
 * same thing as "not configured", but zod sees `""` and fails `.min(1)` even
 * behind `.optional()`. That turned a half-filled .env into a hard boot crash
 * — `npm run seed` could not run without dummy Cloudinary credentials. Blank
 * now collapses to undefined so the optional keys behave as intended, and
 * hasCloudinary()/hasSmtp() keep gating the features that actually need them.
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

// WHY: fail fast at boot with a clear message instead of a cryptic
// "Cannot read properties of undefined" three layers deep at request time.
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)"),
  AUTH_URL: optionalUrl,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: optionalPort,
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_FROM: optionalString,
  SITE_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url().default("https://lockshield.ae")
  ),
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

export function hasCloudinary(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function hasSmtp(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
