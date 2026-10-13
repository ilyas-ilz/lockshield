import type { NextConfig } from "next";

// Public domain of the R2 bucket (R2_PUBLIC_URL, e.g. https://cdn.lockshield.ae
// or https://pub-<hash>.r2.dev). Read at build time, so on Vercel it must be
// set before the deploy that should use it.
const mediaCdnHost = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined;
  } catch {
    return undefined;
  }
})();

// Uploaded media: only our own R2 public domain.
// WHY no wildcards (*.r2.dev, *.digitaloceanspaces.com, Cloudinary): every
// stored URL was migrated to the CDN (verified: no document references
// those hosts), and a wildcard let /_next/image fetch and re-serve images
// from *anyone's* bucket on our domain and our image-optimization bill.
const mediaImgSources = mediaCdnHost ? `https://${mediaCdnHost}` : "";

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' blob: data: ${mediaImgSources} https://www.google-analytics.com https://www.googletagmanager.com`,
  "font-src 'self' data: https://fonts.gstatic.com",
  // WHY no storage host here: the browser never talks to R2 directly -
  // uploads go through /api/upload, which validates and sanitizes first.
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
];

const securityHeaders = [
  // Hardened security headers including CSP, HSTS, frame denial, and COOP
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise the framework (X-Powered-By: Next.js)
  serverExternalPackages: ["sharp"],
  images: {
    // WHY a long TTL: R2 keys are random per upload and never overwritten, so
    // an optimized variant can stay cached for a month without going stale.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      ...(mediaCdnHost ? [{ protocol: "https" as const, hostname: mediaCdnHost }] : []),
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
