# Performance and Image Audit: https://www.lockshield.ae

Audit date: 2026-10-12. Read-only. No repo files were edited.

## Scores

| Area | Score | Confidence |
|---|---|---|
| Performance (Core Web Vitals) | 70 / 100 | Medium-low. Only 2 of 6 pages have lab runs. No field data. |
| Images | 74 / 100 | Low-medium. Image table is partial (see gaps). |

## Method and data provenance (read this first)

| Data | Source | Type |
|---|---|---|
| Home and /services: score, FCP, LCP, TBT, CLS, SI, resource weights, insights | Lighthouse 13.5.0, mobile preset (simulated Slow 4G, 4x CPU), headless Chrome on a Windows dev machine. One run per page. | LAB |
| TTFB, cache headers, compression, HTML size | curl, one sample per page, taken while a Lighthouse batch was running on the same machine | MEASURED by curl (single sample, noisy) |
| HTML size breakdown, script/link inventory | `lockshield.ae-audit/homepage.html` (saved raw HTML) | STATIC ANALYSIS |
| Repo findings | `next.config.ts`, `src/app/layout.tsx`, `public/` listing, grep of `src` | STATIC ANALYSIS |
| INP | Not measurable in the lab. TBT is used as a proxy. | PROXY |

- PageSpeed Insights keyless API returned HTTP 429 ("Queries per day" quota exhausted), so there is no PSI or CrUX data.
- All "good / poor" labels below are lab-based. Lab values are not a field pass/fail verdict.

## Lab metrics (Lighthouse 13.5.0, mobile)

| Page | Perf score | FCP | LCP | TBT (INP proxy) | CLS | Speed Index | TTI | Weight | Best Practices |
|---|---|---|---|---|---|---|---|---|---|
| / | 78 | 3.5 s | 4.3 s (Poor, >4.0) | 50 ms | 0 | 3.5 s | 4.8 s | 632 KiB, 39 requests | 100 |
| /services | 80 | 3.2 s | 4.1 s (Poor, >4.0) | 0 ms | 0 | 3.2 s | 4.1 s | 371 KiB, 32 requests | 100 |
| /services/fire-extinguisher-refilling | NOT RUN | | | | | | | | |
| /projects | NOT RUN | | | | | | | | |
| /blog/protecting-data-centers-fm-200-clean-agent-suppression | NOT RUN | | | | | | | | |
| /contact | NOT RUN | | | | | | | | |
| Desktop (all pages) | NOT RUN | | | | | | | | |

Resource summary (Lighthouse, transfer size):

| Page | Total | Script | Image | Font | CSS | Document |
|---|---|---|---|---|---|---|
| / | 632 KB | 19 req, 246 KB | 12 req, 280 KB | 3 req, 54 KB | 2 req, 22 KB | 26 KB |
| /services | 371 KB | 20 req, 247 KB | 2 req, 18 KB | 3 req, 53 KB | 2 req, 22 KB | 15 KB |

Third-party requests are 4 requests (55 KB) on both pages, all Google Fonts. No GA/GTM request fired during the lab load.

## Server response and caching (curl, single sample, ESTIMATE)

| URL | TTFB incl. TLS | Brotli size on wire | Cache-Control | X-Vercel-Cache | Rendering |
|---|---|---|---|---|---|
| / | 0.26 s | 25.1 KB (raw 236 KB) | public, max-age=0, must-revalidate | STALE (Age 304) | Prerendered (ISR) |
| /contact | 0.28 s | 14.0 KB | public, max-age=0, must-revalidate | STALE (Age 398) | Prerendered (ISR) |
| /services | 4.54 s | 13.8 KB | private, no-cache, no-store, max-age=0 | MISS | Dynamic |
| /services/fire-extinguisher-refilling | 0.91 s | 15.7 KB | private, no-cache, no-store, max-age=0 | MISS | Dynamic (`/services/[slug]`) |
| /projects | 0.63 s | 13.4 KB | private, no-cache, no-store, max-age=0 | MISS | Dynamic |
| /blog/protecting-data-centers-... | 0.75 s | 14.0 KB | private, no-cache, no-store, max-age=0 | MISS | Dynamic (`/blog/[slug]`) |

- The `X-Vercel-Id` header reads `bom1::iad1::...`. The edge is Mumbai and the function region is iad1 (US East). That is far from a UAE audience for any dynamic render.
- Lighthouse reports "Root document took 60 ms" for both / and /services. The 4.5 s curl sample is therefore probably a cold start or DB-query spike, or it was inflated by the concurrent Lighthouse run. It needs a repeat sample.

## Homepage HTML size (236 KB raw, 25 KB brotli)

The size is explained and is mostly not a wire problem:

- About 153 KB is markup, made up of:
  - About 70 KB of Tailwind `class` attributes.
  - About 35 KB of inline SVG (77 `<svg>` elements, 123 `<path>`).
  - About 24 KB of `<img>` tags (30 images, about 14.7 KB of that is `srcSet`).
  - About 5.6 KB of inline `style` attributes.
- About 75 KB is RSC flight data in 39 `self.__next_f.push` script blocks. These carry the page content a second time for hydration.
- Two JSON-LD blocks add about 4 KB.
- There are about 970 tags, so DOM size is under the 1,500 threshold.
- Brotli is active, so 25 KB on the wire is fine.

## What works

1. HTML is Brotli-compressed and the home page and /contact are prerendered and edge-cached. Homepage wire size is 25 KB and Lighthouse root-document time is 60 ms.
2. `next/image` is used site-wide. It serves WebP with `srcset`, and the hero (`bg-banner-01.webp`) and logo are preloaded. CLS is 0 on both tested pages.
3. No legacy jQuery or vendor scripts are loaded. The HTML references only one app CSS file (about 21 KB) plus Next chunks. TBT is 50 ms and 0 ms, so INP risk is low (lab proxy only).
4. Page weight is modest. No single request exceeded 60 KB on / or /services. Lighthouse Best Practices is 100.
5. Preconnect hints exist for `fonts.googleapis.com` and `fonts.gstatic.com`, which softens the font cost. The `noModule` polyfills bundle is not downloaded by modern browsers.

## Findings

### 1. Render-blocking Google Fonts stylesheet delays FCP and LCP (High)
- Evidence (lab): `render-blocking-insight` estimates 1,960 ms FCP savings on / and 1,990 ms on /services, including a 2,000 ms LCP saving on /services. The fonts CSS wastes about 1,035 ms and the app CSS about 379 ms on /. FCP is 3.5 s and 3.2 s. LCP is 4.3 s and 4.1 s.
- The request requires a third-party connection and font files (Archivo 34 KB, Chakra Petch 2 x 10 KB). It asks for Archivo 300 to 800 (6 weights) plus Chakra Petch 400 to 700.
- Fix, `src/app/layout.tsx`: replace the `<link href="https://fonts.googleapis.com/css2?...">` with self-hosted fonts that do no network fetch at build time.
  - Option A: `next/font/local` with woff2 files committed to the repo.
  - Option B: `@fontsource-variable/archivo` plus `@fontsource/chakra-petch` imported in the layout.
  - Use only the weights actually used and set `font-display: swap` plus `adjustFontFallback`.
  - Then remove `fonts.googleapis.com` and `fonts.gstatic.com` from `style-src` and `font-src` in `next.config.ts`.
  - The existing comment in `layout.tsx` says `next/font/google` crashed the Vercel build. `next/font/local` and fontsource avoid that.

### 2. Hero/LCP image is not priority-hinted, and AVIF is not enabled (Medium-High)
- Evidence (lab): `lcp-discovery-insight` shows the request is discoverable and eager, but "fetchpriority=high should be applied to the image preload request" is false.
- The hero is preloaded as a responsive `srcset` (640 to 750 and up).
- `next.config.ts` sets no `images.formats`, so only WebP is offered.
- Fix:
  - On the hero `next/image` (home hero component under `src/components`, exact file not identified), set `priority` / `fetchPriority="high"` and an accurate `sizes="100vw"`.
  - Add `images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 2592000 }` in `next.config.ts`.
  - Lighthouse also flagged a viewport-sized, absolutely-positioned `img.object-cover` with `alt=""` and `loading="lazy"` on the home page. Lighthouse says the real LCP element is eager, so this is probably a non-first slide. Confirm that the first slide is not lazy.

### 3. Key content routes are dynamically rendered with no edge cache; TTFB variable (High, needs confirmation)
- Evidence (curl, single sample):
  - /services, /services/[slug], /projects and /blog/[slug] returned `Cache-Control: private, no-cache, no-store`, `X-Vercel-Cache: MISS` and no `X-Nextjs-Prerender`.
  - / and /contact are prerendered and cached.
  - TTFB was 0.63 to 0.91 s on the dynamic pages versus 0.26 to 0.28 s on the cached ones, plus a 4.54 s outlier on /services.
  - The function region is iad1 (US East).
- The cause is not verified. Candidates are `dynamic = "force-dynamic"`, `cookies()`/`headers()`, `searchParams`, or `noStore` in the route files.
- Fix, route files `src/app/(public)/services/page.tsx`, `src/app/(public)/services/[slug]/page.tsx`, `src/app/(public)/projects/page.tsx`, `src/app/(public)/blog/[slug]/page.tsx` (paths inferred from `X-Matched-Path`, not opened):
  - Make them static/ISR with `generateStaticParams` and `revalidate`.
  - Call `revalidatePath`/`revalidateTag` from admin mutations.
  - Move the Vercel function region closer to the DB and UAE (`vercel.json` `regions`).

### 4. JavaScript payload is heavier than a brochure site needs (Medium)
- Evidence (lab): 19 to 20 script requests and about 246 KB compressed JS on every page. `legacy-javascript-insight` flags 12 KiB of avoidable transpilation/polyfill code (`Array.prototype.at`) in `_next/static/chunks/1255-*.js`.
- `<Toaster>` from `sonner` is mounted in the root layout (`src/app/layout.tsx`), so it ships on every public page.
- Fix:
  - Move `<Toaster>` into the admin and contact-form layouts.
  - Run `@next/bundle-analyzer` and `dynamic()`-import below-the-fold client components.
  - Set a modern `browserslist` and find the dependency shipping the polyfill.

### 5. Image delivery savings and oversize sources (Medium-Low)
- Evidence (lab): `image-delivery-insight` estimates 47 KiB of savings on / and 12 KiB on /services. On /services the flagged image is the footer logo, rendered at 80x64 with alt "Lock Shield - Firefighting and Safety Equipment Instal..." (the alt is truncated in the tool output).
- The home page loaded 12 images at 280 KB in the lab. Lazy images below the fold were not triggered, so real full-scroll weight is higher.
- Fix: footer logo component (shared footer under `src/components`) with correct `width`/`height`/`sizes`, AVIF (finding 2), and a longer `minimumCacheTTL`.

### 6. Repo hygiene: dead legacy assets (Low)
- Evidence (static): `public/assets/vendors` is 5.4 MB (jQuery, owl, isotope, etc.). `grep` in `src` finds no references, and the homepage HTML contains none. `public/assets/images` is 21 MB, with `.jpg`/`.png` originals sitting beside `.webp` twins (`bg-banner-01.jpg`, `designing-1..4.jpg`, `hospitals.jpg`, `banner-1.png`, ...). `public/assets/css` and `public/assets/js` are also legacy.
- They are not shipped to users, but they are publicly fetchable and inflate deploys. `public/assets/images/bash.exe.stackdump` should be deleted.
- Fix: delete unreferenced files under `public/assets/vendors`, `public/assets/css`, `public/assets/js` and the original jpg/png twins after confirming CMS content does not reference them.

### 7. Large HTML and RSC payload (Low)
- Evidence: 236 KB raw (75 KB RSC flight data, 35 KB inline SVG, 70 KB class strings), only 25 KB on the wire.
- Fix: use shared SVG sprites or icon components, and pass less serialized data to client components in the home sections.

## Images table (PARTIAL)

Only pages with lab data have network-level image numbers. Per-image `<img>` attributes could not be parsed for the four pages not run, because the curl HTML was saved Brotli-compressed. Per-image HEAD requests were not made.

| Page | Image / scope | Format | Size | Alt | width/height | loading | Notes |
|---|---|---|---|---|---|---|---|
| / | 12 image requests during lab load | WebP via `/_next/image` | 280 KB total, none >60 KB | not audited individually | next/image sets them | hero eager, others lazy | 30 `<img>` tags in the saved HTML, markup 24 KB |
| / | Hero `bg-banner-01.webp` (preloaded, srcset 640 to 750 and up) | WebP | each under 60 KB | `alt=""` (decorative) | next/image | eager (preload), no fetchpriority=high | See finding 2 |
| / | Viewport-sized `img.object-cover` | WebP | n/a | `alt=""` | next/image | lazy | Probably a non-first slide; confirm |
| / | `logo-shield.webp` (preloaded, 48 px / 96 px) | WebP | small | not audited | next/image | eager | |
| /services | Footer logo (80x64 rendered) | WebP | within 18 KB total for 2 images | "Lock Shield - Firefighting and Safety Equipment Instal..." (descriptive) | next/image | not checked | 12 KiB savings flagged |
| /services/fire-extinguisher-refilling | NOT AUDITED | | | | | | |
| /projects | NOT AUDITED | | | | | | |
| /blog/protecting-data-centers-fm-200-clean-agent-suppression | NOT AUDITED | | | | | | |
| /contact | NOT AUDITED | | | | | | |

- No single image request over 60 KB was observed on / or /services, so none exceeds the 200 KB threshold on those loads. This does not cover below-the-fold lazy images or the unaudited pages.
- No non-WebP/AVIF image was observed in the lab network log of / and /services.

## Gaps and next steps

- No PSI or CrUX data (keyless PSI quota exhausted), so there is no field LCP/INP/CLS. Run `scripts/pagespeed_check.py` / `crux_history.py` once an API key exists.
- Lighthouse was run for 2 of 6 pages, mobile only. The batch was halted at the turn limit. Still to run: /services/<slug>, /projects, blog post, /contact, and desktop for all.
- TTFB is a single curl sample per page, taken during concurrent Lighthouse runs. Repeat 5 or more times, spaced out.
- Not checked: cache headers of `/_next/static` and `/_next/image`, per-image HEAD sizes and alt text on the four unrun pages, and the actual cause of dynamic rendering (route source not opened).
- Lab runs used simulated mobile throttling from a non-UAE location, so absolute times will differ from UAE field data.
