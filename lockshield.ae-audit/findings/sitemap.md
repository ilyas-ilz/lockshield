# Sitemap audit: https://www.lockshield.ae/sitemap.xml

Date: 2026-10-12. Method: read-only GETs, no redirect following, about 1.6 req/sec, no forms or POSTs, no repo edits.
Generator: `D:\Projects\lockshield.ae\src\app\sitemap.ts` (revalidate 3600).

**Score: 72/100.** The sitemap is technically clean: valid XML, every URL is 200 with a matching canonical, and nothing is missing. It loses points because `lastmod` is not trustworthy and because it advertises duplicate and thin blog posts.

## Check table

| Check | Result | Evidence |
|---|---|---|
| XML validity | PASS | Parses cleanly. Root `urlset`, namespace `http://www.sitemaps.org/schemas/sitemap/0.9`, 77 `<url>`, 15,774 bytes, `Content-Type: application/xml`. Far under the 50,000 URL / 50 MB limits, so no index file is needed. |
| Sitemap vs `urls.txt` | PASS | The live sitemap and `urls.txt` are identical (77 URLs, same order). No duplicates. |
| `<loc>` hygiene | PASS | All `https://www.lockshield.ae`, no query strings, no trailing slashes, no uppercase. Home is the bare host and matches its canonical exactly. |
| Status codes | PASS | 77/77 return 200 with no `Location` header. No redirects, 404s or 5xx. |
| Canonical match | PASS | 77/77 have exactly one `<link rel="canonical">` equal to the sitemap URL. |
| noindex | PASS | No `X-Robots-Tag` header and no `<meta name="robots">` on any of the 77 pages, so none are noindexed. |
| Missing indexable pages | PASS | All 58 blog posts reachable through `/blog?page=1..7` (6 pages of 9, then 4) are in the sitemap. The 6 services and 6 projects linked from the index pages are also all listed. Nothing is linked and indexable but unlisted. |
| Pages that should not be listed | FAIL (content) | Duplicate and thin blog posts are listed. See findings 2 and 3. |
| `lastmod` accuracy | FAIL | See findings 1 and 2. |
| `changefreq` / `priority` | INFO | Present on all 77 entries. Google ignores both. See finding 4. |
| robots.txt Sitemap line | PASS | `Sitemap: https://www.lockshield.ae/sitemap.xml` is present, absolute, and on the same host. `/admin/` and `/api/` are disallowed and the sitemap itself is not blocked. |
| Image sitemap | Opportunity | See finding 6. |

## Findings

### 1. Static pages use `new Date()`, so their `lastmod` is fake freshness (Medium)
- Evidence: the 7 static URLs (home, about, services, projects, blog, career, contact) all carry `2026-10-12T10:34:20.110Z`, to the millisecond. That is the hourly ISR regeneration time, not an edit time. The response was `Age: 3259`, so the value moves every hour and no page content changed.
- Fix, `src/app/sitemap.ts` lines 46-52: stop calling `new Date()`.
  - `/blog`, `/services`, `/projects`: use the newest `updatedAt` of their collection (posts, services, projects).
  - Home: use the newest of those three.
  - `/about`, `/contact`, `/career`: omit `lastModified`, or use a constant that you bump by hand when the page really changes.
  - The `catch` fallback must not emit `new Date()` either.
- Sketch: `const latest = (d: SlugDoc[]) => d.reduce<Date | undefined>((m, x) => x.updatedAt && (!m || x.updatedAt > m) ? x.updatedAt : m, undefined);`

### 2. Per-document `lastmod` is the bulk-import timestamp, not a real edit date (Medium)
- Evidence: all 70 post, service and project `lastmod` values fall in one 26-second window, `2026-09-23T10:02:49Z` to `10:03:15Z`. Post JSON-LD `datePublished` spans 2023-12-17 to 2026-09-23, but `dateModified` is the import time on all 58 posts. For example, `fire-extinguisher-types` was published 2023-12-17 and has `dateModified` 2026-09-23T10:03:10Z.
- Google discounts `lastmod` when it is clearly not tied to content changes, and a one-minute spread across 70 URLs looks like that.
- Fix:
  - Backfill `updatedAt`, or add a dedicated `contentUpdatedAt` field on `Post`, `Service` and `Project` (`src/models`). Update it only when the body changes.
  - In `sitemap.ts` lines 55-63, use `contentUpdatedAt ?? publishedAt ?? updatedAt` (the publish-date field name was not verified).
  - Make the blog post route's Article JSON-LD `dateModified` use the same field, so the page and the sitemap agree.

### 3. Duplicate and thin blog posts are listed and self-canonical (High)
- Duplicate pairs. Each is self-canonical, has an identical `<title>`, and both URLs are in the sitemap. Overlap is 8-word shingle overlap against the shorter body.
  - `/blog/fire-alarm-sounders` and `/blog/fire-alarm-sounders-2`: 100% overlap, identical text.
  - `/blog/fire-alarm-smoke-detector-supplier-in-uae` and `.../-2`: 100%, identical text.
  - `/blog/co2-fire-extinguisher-supplier-in-uae` (1,034 words) and `.../-2` (431 words): 100%, the `-2` page is a subset.
  - `/blog/emergency-light-supplier` (328 words) and `.../-2` (480 words): 96%.
- Thin posts. 15 posts have under about 140 words of body text:
  - `fire-extinguisher-types` (44, cut off mid-sentence), `emergency-lighting-system` (52), `fire-detection-and-notification-system` (63), `fire-protection-companies-in-dubai` (72), `fire-alarm-system-installation` (82), `what-is-fire-alarm-system` (83), `best-fire-alarm-system-in-uae` (100), `suppression-and-special-hazard-systems` (100), `benefits-of-fire-alarm-system-in-uae` (102), `sprinkler-systems` (114), `fire-pump` (123), `test` (133), and 3 more.
  - The three newest posts, published 2026-09-23, have only about 85 words each: an excerpt repeated twice plus one boilerplate paragraph. They share about 60% of their text with each other, and have no headings.
  - Several of these look like truncated legacy imports.
- `/blog/test`: the slug is `test` but the page is a real post titled "Fire Alarm Companies in Dubai" (about 133 words). The slug is unprofessional and hurts the URL.
- Why it matters: the sitemap tells Google these are all canonical, indexable pages. That invites index bloat, keyword cannibalisation on the supplier terms, and a site-wide low-quality signal.
- Fix:
  - For each duplicate pair, keep the longer body and 301 the other slug to it (`next.config` redirects). Alternatively set the loser to draft so the `Post.find({ status: "published" })` query in `src/app/sitemap.ts` line 36 drops it.
  - For thin posts, either expand them to real articles or unpublish and redirect them.
  - Add a `noindex` boolean or `indexable` flag on `Post`. Filter on it in `sitemap.ts`, and emit `robots: { index: false }` in the post route's metadata, so a post can be live without being advertised.
  - Rename or redirect `/blog/test`.

### 4. `changefreq` and `priority` on all 77 entries (Info)
- Evidence: every `<url>` has both. Google ignores both. `/blog` says `daily`, which is not true.
- Fix: delete `changeFrequency` and `priority` from every entry in `src/app/sitemap.ts` lines 46-62. Harmless to leave, but it is noise and it misleads.

### 5. Project pages have very little unique text (Medium, caveat below)
- Evidence: each `/projects/*` page is about 150-157 words in total. About 120 of those are nav and footer, so about 30-35 words are unique. Service pages are about 290-300 words total, so about 170 unique.
- Caveat: this is a text count of the server HTML. It excludes script, style, template and svg, and it was not visually verified. Content loaded only on the client would not be counted.
- Fix: this is a content task rather than a sitemap one. Add scope, systems installed, standards, DCD approval and location per project (`Project` model and `src/app/(public)/projects/[slug]`). Until then, consider whether these URLs earn their place in the sitemap.

### 6. Image sitemap (Low, opportunity)
- Evidence: project, service and blog pages carry hero and gallery images. Per the CSP they are served from `digitaloceanspaces.com` and `res.cloudinary.com`, and from `/assets/images/...`. The sitemap has no `<image:image>` entries. One post's JSON-LD uses the generic `/assets/images/service/service-1.webp`.
- Fix: add `images: [absoluteUrl]` to the project, service and post entries in `src/app/sitemap.ts` (lines 55-63). Next.js supports an `images` field on sitemap entries in recent versions (14.2 and later; confirm against the repo's Next version). Image URLs must be absolute. The payoff is modest: around 12 projects and services plus a few blog hero images.

### 7. Out-of-range pagination returns 200 (Low)
- Evidence: `/blog?page=8` and `/blog?page=0` return 200 with the canonical set to `/blog`. They clamp to the last or first page instead of returning 404. Pages 2-7 also canonicalise to `/blog`, which is fine because the sitemap lists every post.
- Fix: in the blog index route, `notFound()` when `page` is out of range, or redirect to the clamped page.

## What was checked and is fine
- `/blog?page=N` pages are not in the sitemap and should not be: all canonicalise to `/blog`.
- `/projects?sector=Banking|F%26B|Healthcare|Retail` are not listed and should not be: all canonicalise to `/projects`.
- `/assets/images/company-profile.pdf` is linked sitewide and not listed. That is acceptable.
- Cache: `public, max-age=0, must-revalidate`, `X-Vercel-Cache: HIT`. This matches the hourly ISR.

## Not checked
- Whether `http://` and apex `lockshield.ae` 301 to `https://www`. Not tested within the turn limit; the coordinator reports the host fix as done.
- Image counts per page. The image findings come from one sample plus the CSP, not a crawl.
- Whether a page is indexed in Google, which would need Search Console data.
- Possible U+FFFD characters in a few post titles. They appeared in my terminal output, but the footer copyright sign showed the same artifact, so this is most likely my console decoding and not a site bug. Not reported as a finding.
- Other observations outside sitemap scope:
  - One blog post contains a broken external link `href="http://v"`; its page was not identified.
  - Several posts link to `eminentsoft.blogspot.com`, a Google Doc, and a competitor (`phoenix-uae.com`). Worth a content review.
  - Word counts are approximate, taken from server-rendered HTML.
