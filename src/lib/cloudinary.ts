import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "./env";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const env = getEnv();
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary env vars are not set (CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET)");
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

/**
 * Signed upload params for direct browser -> Cloudinary upload.
 * WHY signed direct upload, not proxy-through-our-server: Vercel serverless
 * functions have a request body size ceiling (4.5MB on the Hobby tier) —
 * routing project gallery photos through our own API would fail on
 * anything but thumbnails. Signing a short-lived params bundle lets the
 * browser upload straight to Cloudinary while we still control folder,
 * expiry, and (via the signature) that only our server-issued uploads succeed.
 */
export function createSignedUploadParams(folder: string): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  ensureConfigured();
  const env = getEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET!);

  return { timestamp, signature, apiKey: env.CLOUDINARY_API_KEY!, cloudName: env.CLOUDINARY_CLOUD_NAME!, folder };
}

export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
