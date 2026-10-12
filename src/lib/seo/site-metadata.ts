import type { Metadata } from "next";

// Shared by the root layout and the home page. Next replaces `openGraph`
// wholesale when a page sets it, so a page that overrides og:url must
// re-supply the rest or lose siteName/images.
export const DEFAULT_OPEN_GRAPH = {
  type: "website",
  siteName: "Lock Shield",
  locale: "en_AE",
  url: "./",
  images: [{ url: "/assets/images/banner-1.png", width: 1600, height: 567, alt: "Lock Shield fire protection, Dubai UAE" }],
} satisfies NonNullable<Metadata["openGraph"]>;
