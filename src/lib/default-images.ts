import { getEnv } from "./env";

/**
 * Branded fallback cover for blog posts saved without one (logo on the
 * site's blueprint-grid paper, 1600x1000 = the cards' 16:10).
 *
 * WHY on R2 under a fixed key: it is served from the same CDN as every other
 * post image, and lockshield/defaults/ sits outside the upload key layout
 * (storage.ts R2_UPLOAD_KEY), so deleting media in the admin can never
 * remove it. The repo copy at /assets is the fallback for environments
 * without R2 (local dev) - regenerate both together if the design changes.
 */
const R2_KEY = "lockshield/defaults/blog-cover.webp";
const LOCAL_PATH = "/assets/images/blog/default-cover.webp";

export function defaultBlogCover(title?: string): { url: string; alt: string } {
  const publicUrl = getEnv().R2_PUBLIC_URL;
  return {
    url: publicUrl ? `${publicUrl.replace(/\/+$/, "")}/${R2_KEY}` : LOCAL_PATH,
    alt: title ? `${title} - Lock Shield` : "Lock Shield fire safety article",
  };
}
