# Technical SEO Audit - https://www.lockshield.ae

Date: 2026-10-12. Method: read-only curl against production (about 1.5 req/s, no POSTs, no /api calls) plus repo source inspection. All 77 sitemap URLs fetched.

**Technical score: 72 / 100**

| Category | Status | Note |
|---|---|---|
| Crawlability | PASS | robots.txt and sitemap are clean, no noindex leaks |
| Indexability | FAIL | 4 duplicate blog pairs, 16 thin posts, junk `/blog/test` |
| Security | PASS (minor) | Full header set on www; CSP allows unsafe-inline/unsafe-eval; HSTS preload mismatch on apex |
| URL structure and redirects | FAIL | Legacy .html 301s leave the domain for lockshield-ten.vercel.app |
| Mobile | PASS | Viewport meta on 77/77. Touch targets not measured |
| Core Web Vitals (source signals) | NOT MEASURED | Source signals only (see M4, L5) |
| Structured data | PARTIAL | 18 of 77 pages have no JSON-LD |
| JS rendering | PASS | Content is in raw HTML |
| IndexNow | NOT VERIFIED | See Unchecked |

## Verified as holding from today's fixes (not new findings)

- Canonical on all 77 pages is an absolute `https://www.lockshield.ae/...` URL and exactly equals the sitemap `<loc>` (77/77) and og:url (77/77).
- The home canonical is `https://www.lockshield.ae` (no `/index`).
- Sitemap, robots `Sitemap:` line and llms.txt all use the www host.

## What works

- No `<meta name="robots">` and no `X-Robots-Tag` on any of the 77 pages. Every page returns 200 with no redirects. The sitemap has 77 URLs, identical to `urls.txt`, with no duplicates.
- robots.txt (200): `Allow: /`, `Disallow: /admin/`, `Disallow: /api/`, GPTBot/PerplexityBot/ClaudeBot/Google-Extended allowed, `Sitemap: https://www.lockshield.ae/sitemap.xml`. `/llms.txt` exists.
- Protocol and host redirects: `http://www` is a 308 to https; `https://lockshield.ae` is a 308 to www; `/cart/` is a 308 to `/cart` (trailing slash normalised).
- Security headers on www: HSTS `max-age=31536000; includeSubDomains; preload`, CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `COOP: same-origin`. `X-Powered-By` is suppressed.
- Content is in the raw HTML. All 77 pages are 95-236 KB. The median blog post has about 1,100 words. Each page has exactly one H1 and a viewport meta tag (`width=device-width, initial-scale=1`). Unknown paths return a real 404 status (observed on `/cart`, `/demo`, `/*-old-backup`), not a soft 404.

## Findings

### C1 - CRITICAL: legacy .html 301s send visitors and bots to lockshield-ten.vercel.app, not www.lockshield.ae

Evidence:
- `curl -I https://www.lockshield.ae/about.html` returns `HTTP/1.1 301` with `Location: https://lockshield-ten.vercel.app/about`.
- 78 of 80 probed legacy paths (13 root pages, 55 `/blog/*.html`, old-backup, cart, demo) redirect to `lockshield-ten.vercel.app`. The other 2 are `/cart/` and `/demo/`, which get a 308 to a 404 on www.
- Chain from the old canonical host: `http://lockshield.ae/blog/fire-pump.html` takes 3 hops and ends on `https://lockshield-ten.vercel.app/blog/fire-pump` (200).
- The final page on the vercel.app host returns 200. Its canonical points back to www, because canonicals resolve against `SITE_URL`.
- Cause: `src/middleware.ts` lines 28-30 build the target with `new URL(target, req.nextUrl.origin)`. The NextAuth `auth()` wrapper rewrites `req.nextUrl.origin` from `AUTH_URL`. `AUTH_URL` (`src/lib/env.ts`, `optionalUrl`) on Vercel appears to be the vercel.app host. This last step is a hypothesis; I did not read the Vercel env.
- The same `origin` is used for the admin login redirects (middleware lines about 36 and 48).
- The old site's backlinks and Google's index use `lockshield.ae/*.html`. Every one of them is currently handed to another host.

Fix:
- In `src/middleware.ts`, stop using `req.nextUrl.origin` for redirects. Use the configured site URL: `new URL(target, process.env.SITE_URL ?? "https://www.lockshield.ae")`.
- Also set Vercel `AUTH_URL=https://www.lockshield.ae` (or remove it and rely on `AUTH_TRUST_HOST=true`).
- Optionally add a host-based redirect from `*.vercel.app` to www in `next.config.ts` `redirects()` (`has: [{type:"host", value:"lockshield-ten.vercel.app"}]`).
- Re-test all 80 paths in `lockshield.ae-audit` afterwards. Target is 301 to `https://www.lockshield.ae/<clean path>` and then 200.

### H1 - HIGH: lockshield-ten.vercel.app serves the full site as a duplicate host

Evidence: C1 shows `https://lockshield-ten.vercel.app/about` returns 200. Its robots, X-Robots-Tag and indexability were not checked. Canonicals are right, but Google will discover this host through the legacy redirects.

Fix:
- Redirect every non-www host to www (see C1).
- At minimum, serve `X-Robots-Tag: noindex` when `host != www.lockshield.ae`. Do this in `src/middleware.ts` (extend its matcher) or in Vercel project settings.

### H2 - HIGH: four exact-duplicate blog pairs, all self-canonical and all in the sitemap

Evidence (text similarity 0.99-1.00, identical titles):
- `/blog/co2-fire-extinguisher-supplier-in-uae` and `.../-2`
- `/blog/emergency-light-supplier` and `.../-2` (the third pair below has the same shape)
- `/blog/fire-alarm-smoke-detector-supplier-in-uae` and `.../-2`
- `/blog/fire-alarm-sounders` and `.../-2`

The duplicate titles are "CO2 Fire Extinguisher Supplier in UAE | Lock Shield UAE", "Emergency Light Supplier | Lock Shield UAE", "Fire Alarm Smoke Detector Supplier in UAE | Lock Shield UAE" and "Fire Alarm Sounders | Lock Shield UAE".

Fix:
- Unpublish the four `-2` posts in admin. `src/app/sitemap.ts` only lists `status: "published"`, so they drop out of the sitemap.
- 301 each `-2` slug to its original. Do this in `next.config.ts` `redirects()`. The admin Redirect collection alone will not work: `src/app/[...slug]/page.tsx` only runs when no other route matched, and `/blog/[slug]` matches first.

### H3 - HIGH: thin or truncated posts are indexed

Evidence: 16 of 58 blog posts have fewer than 300 words including nav and footer, which is roughly 50-130 words of real body.
- `/blog/fire-extinguisher-types` (145 words) ends mid-sentence at "The most common classification system".
- `/blog/fire-pump` (222 words) and `/blog/emergency-lighting-system` (153) are the same.
- The 23 Sep 2026 imports are a single intro paragraph, for example `/blog/understanding-dubai-civil-defence-approval-commercial-fitouts` (195) and `/blog/why-annual-maintenance-contracts-amc-mandatory-uae` (203).
- Also thin: `fire-detection-and-notification-system`, `fire-protection-companies-in-dubai`, `fire-alarm-system-installation`, `what-is-fire-alarm-system`, `suppression-and-special-hazard-systems`, `best-fire-alarm-system-in-uae`, `benefits-of-fire-alarm-system-in-uae`, `sprinkler-systems`, `protecting-data-centers-fm-200-clean-agent-suppression`, `why-fire-alarm-system-is-important`.

The first set looks like a legacy import that cut the body at the first paragraph.

Fix: re-import the full bodies from `legacy/blog/*.html`, or expand them. Until then, set them to draft, or add a noindex field and exclude them from `sitemap.ts`.

### M1 - MEDIUM: `/blog/test` is a live, sitemap-listed post with a junk slug

Evidence: `https://www.lockshield.ae/blog/test` returns 200 with H1 "Fire Alarm Companies in Dubai" and 238 words. It overlaps the topic of `/blog/fire-protection-companies-in-dubai`.

Fix: rename the slug to a descriptive one (for example `fire-alarm-companies-in-dubai`), 301 the old slug via `next.config.ts` `redirects()`, and de-duplicate against the other post.

### M2 - MEDIUM: 18 of 77 pages have no JSON-LD

Evidence: 0 `application/ld+json` blocks on `/about`, `/blog`, `/career`, `/contact`, `/projects`, `/services`, the 6 `/services/*` pages and the 6 `/projects/*` pages. Only the home page and the 58 blog posts have schema.

Fix: in `src/lib/seo/jsonld.ts`, add:
- `Service` (with provider, areaServed UAE and Dubai) for `services/[slug]`.
- `CreativeWork` or `Project` for `projects/[slug]`.
- `AboutPage` and `ContactPage` with the LocalBusiness `@id` reference.
- `BreadcrumbList` everywhere.

Render them from `src/app/(public)/{services,projects}/[slug]/page.tsx`, `about/page.tsx` and `contact/page.tsx`. Validate in the Rich Results Test (not done here).

### M3 - MEDIUM: 22 of 77 pages emit no `og:image`

Evidence: og:image is missing on 22 pages. The other 55 have either `banner-1.png` or a post-specific image. I did not list which 22. The `src/lib/seo/site-metadata.ts` comment says Next replaces `openGraph` wholesale when a page sets it, so the likely cause is pages that override openGraph without re-supplying `images`. This is unconfirmed.

Fix: in those pages' `generateMetadata`, spread `...DEFAULT_OPEN_GRAPH` or set `openGraph.images` explicitly.

### M4 - MEDIUM: blog post pages are rendered dynamically on every request and are not cached

Evidence: `/blog/benefits-of-fire-alarm-system-in-uae` returns `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Vercel-Cache: MISS`, `X-Matched-Path: /blog/[slug]`. The home page is `X-Nextjs-Prerender: 1` with `X-Vercel-Cache: HIT`. Only the blog route was header-checked. Each crawler hit is a Mongo query, which hurts TTFB and LCP and makes pages fragile if the DB is slow.

Fix: in `src/app/(public)/blog/[slug]/page.tsx` (and services and projects), add `generateStaticParams` and `export const revalidate = 3600`. Remove whatever forces dynamic rendering (a `cookies()`/`headers()` call, `force-dynamic` or `searchParams`). `revalidate.ts` already exists for on-publish busting.

### M5 - MEDIUM: title and description lengths and slug quality

Evidence:
- Titles: 43 of 77 are over 60 characters (34 over 70, up to 147). Example: `/blog/uaes-trusted-fire-pumps-supplier-...-lockshield-cart` has a 147-character title. Four titles are duplicated (see H2).
- Descriptions: 9 pages are under 110 characters (all 6 `/projects/*`, 85-100; and 3 services, 104-105).
- Slugs: some are keyword-stuffed and over 100 characters. One has a typo: `understanding-exit-lights-nsuring-safety-...`.

Fix:
- Shorten titles to 60 characters or fewer. Remove "| Lock Shield UAE" from long ones by setting `title.absolute`.
- Write 140-155 character descriptions for the project and service pages.
- Do not change existing slugs without a redirect.

### L1 - LOW: sitemap lastmod is not meaningful

Evidence: the 7 static URLs all carry `2026-10-12T10:34:20.110Z` (`new Date()` in `src/app/sitemap.ts`). All 70 content URLs share about `2026-09-23T10:03:15Z`, which is the import timestamp.

Fix: use real `updatedAt` for content URLs and a fixed or last-deploy date for static pages. Drop `changefreq` and `priority`, since Google ignores them.

### L2 - LOW: redirect chains

Evidence: `http://lockshield.ae/` takes 2 hops (http apex, then https apex, then www), which is a Vercel default. Legacy URLs from the old apex host will take 3 hops after C1 is fixed. `/index.html` redirects to `/`, which is correct.

Fix: rely on Vercel's domain settings. Ensure no extra app-level hop is added.

### L3 - LOW: HSTS preload is claimed but not achievable

Evidence: www sends `max-age=31536000; includeSubDomains; preload` (`next.config.ts`). The apex 308 response, which hstspreload.org checks, sends Vercel's `Strict-Transport-Security: max-age=63072000` with no `includeSubDomains` or `preload`.

Fix: either drop the `preload` token from `next.config.ts`, or add an HSTS header with `includeSubDomains; preload` on the apex via Vercel project headers or domain settings, then submit to hstspreload.org.

### L4 - LOW: CSP permits `'unsafe-inline'` and `'unsafe-eval'` in script-src

Evidence: `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com` (`next.config.ts`, `cspDirectives`).

Fix: move to nonce-based CSP via middleware and remove `unsafe-eval` in production. This is not an SEO blocker.

### L5 - LOW: streamed Suspense shell puts the loading skeleton in `<main>`

Evidence: in the raw HTML, `<main>` contains `loading.tsx` shimmer placeholders (`<template id="B:0">`). The real H1 and body sit in `<div hidden id="S:n">` blocks after `</main>` and are revealed by an inline `$RC` script. Example: `/blog/benefits-...` has `<main>` at bytes 9944-24866 and `<h1` at 55254. Content is present for Googlebot and text-extraction crawlers. A no-JS render sees only the skeleton. HTML is heavy, up to 236 KB on the home page.

Fix: consider removing `loading.tsx` on content routes, or keep the content above the Suspense boundary. This is a low risk.

### L6 - LOW: legacy backup, cart and demo URLs end in 404

Evidence: `/*-old-backup.html`, `/cart/index.html` and `/demo/index.html` redirect to a clean path and then return 404. The legacy robots.txt disallowed them.

Fix: after C1, either leave them as 404 or return 410 for them via `next.config.ts` redirects or rewrites. Add them to `LEGACY_HTML_REDIRECTS` only if a replacement exists.

### L7 - LOW / opportunity: no Arabic locale and no hreflang

Evidence: 0 pages emit hreflang. `<html lang="en">` (`src/app/layout.tsx`), og locale `en_AE`. There is no locale route segment in `src/app`.

Fix: none required for English-only. If Arabic is planned, use a `[locale]` segment with `alternates.languages` and defer validation to the `seo-hreflang` sub-skill.

### L8 - LOW: IndexNow not verified

No key file or submission hook was verified. Suggested approach: add a `/<key>.txt` route and call `https://api.indexnow.org/indexnow` from `src/lib/revalidate.ts` when a post, service or project is published.

## Unchecked / limitations

- Soft-404 test on a nonexistent `/blog/<random>` or `/services/<random>` slug and on a not-found page's meta robots was not run. Only observed 404s were `/cart`, `/demo` and the old-backup paths.
- Case sensitivity (`/About`, `/BLOG`) and the `//` and `?utm` variants were not tested.
- Whether `lockshield-ten.vercel.app` serves noindex, robots or a sitemap was not checked (see H1).
- The 22 pages missing og:image were counted, not listed. Twitter card tags were not checked.
- JSON-LD blocks present on home and blog pages were detected but not validated against schema.org requirements.
- Cache headers were captured for the home page and a blog page only. Services and projects were not header-checked.
- TTFB, Lighthouse and CrUX figures were not measured. LCP, INP and CLS were not tested. Touch target sizes were not checked.
- IndexNow (key file probe, submission code) was not searched for.
- Vercel env values (`AUTH_URL`, `SITE_URL`) were not read. The AUTH_URL cause in C1 is inferred from the redirect behaviour and `src/lib/env.ts`.
- I did not use the code-review-graph tools. None were available in this session, so source was read directly.
