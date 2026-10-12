# Full SEO Audit — www.lockshield.ae

**Date:** 12 October 2026 · **Business:** Lock Shield Firefighting & Safety Equipment Installation LLC. This is a fire protection installation and maintenance contractor based in Dubai, serving the UAE. It is a hybrid service-area business.

**Pages audited:** all 77 sitemap URLs: home, about, contact, career, services index + 6 services, projects index + 6 projects, blog index + 58 posts.

## Executive summary

### SEO Health Score: **49 / 100**

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 72 |
| Content Quality | 23% | 27 |
| On-Page SEO | 20% | 41 |
| Schema / Structured Data | 10% | 40 |
| Performance (CWV, lab) | 10% | 70 |
| AI Search Readiness | 10% | 43 |
| Images | 5% | 74 |

Supporting scores, not in the weighted total: **Local SEO 36**, **Mobile/Visual 76**, **Sitemap 72**.

The technical base is solid. Every page returns 200, canonicals are correct, security headers are complete and the site is server-rendered. What holds the site back is **thin content, weak local and brand signals, and missing proof of expertise**, not crawling problems.

### Top 5 critical issues
1. **Legacy `.html` URLs redirect to the wrong host.** 78 of 80 old URLs 301 to `lockshield-ten.vercel.app` (`src/middleware.ts:28-30`), so old backlinks pass their value to a duplicate host.
2. **No Google Business Profile found via search, and conflicting NAP.** There are three different addresses and two different phones across the site, YellowPages.ae and 2GIS.
3. **Service pages are thin templates**: about 140 unique words each, no FAQs, no schema. There are no pages for fire alarm installation, sprinklers or fire pumps.
4. **Blog quality.** There are 4 exact-duplicate pairs and 17 posts under 300 words. The 3 newest "guides" are about 120 words each. Some text reads as spun.
5. **Wrong LinkedIn in `sameAs`.** `linkedin.com/company/lockshield` is reported to be a French VPN company.

### Top 5 quick wins
1. Fix the middleware redirect host: a one-line change, already diagnosed.
2. Remove or replace the wrong LinkedIn link in Admin → Settings → Social Profiles.
3. Unpublish the 4 `-2` duplicate posts and `/blog/test`.
4. Bing Webmaster Tools → import from Search Console (5 minutes).
5. Add spaces to the home H1 and put "Dubai" and "Civil Defence" in it.

## Category summaries

Full evidence for each category is in `findings/`.

### Technical SEO — 72 → `findings/technical.md`
- **Works:**
  - All 77 URLs return 200 with no redirects and no noindex.
  - Canonical, og:url and sitemap URLs all match on www (77/77).
  - http, apex and trailing-slash variants each need one 308.
  - HSTS, CSP, X-Frame-Options and nosniff are all set.
  - Unknown URLs return a real 404.
- **Issues:**
  - Legacy redirect host (Critical).
  - vercel.app duplicate host (High).
  - Duplicate and thin posts in the index.
  - 18 pages have no JSON-LD.
  - 22 pages have no og:image.
  - Blog, services and projects render dynamically (`no-store`).
  - Meaningless sitemap lastmod.
  - HSTS preload is not honoured on the apex.

### Content Quality — 27 / On-Page — 41 → `findings/content.md`
- **Works:** one H1 per page, branded titles, and a 946-word home page with a real FAQ. CTAs are on every page, and four strong long-form posts exist.
- **Issues:**
  - Service pages are about 140 unique words. Project pages are about 60 words.
  - 17 thin posts and 4 duplicate pairs.
  - About 20 cannibalising "supplier in UAE" posts.
  - 49 of 58 posts have no inbound internal links.
  - Anonymous "Engineering Desk" author.
  - A split "LockShield Cart" brand.
  - Spun text.
  - 43 titles over 60 characters, and descriptions cut mid-word.
  - The H1 runs together.

### Schema — 40 → `findings/schema.md`
- **Works:** all existing JSON-LD is valid. NAP in the schema matches the page. Blog posts have Article + BreadcrumbList, and home has LocalBusiness + FAQPage.
- **Issues:**
  - Only home and blog posts have schema.
  - No Service schema, even though the builder already exists.
  - LocalBusiness is generic, with no geo, hours or region, and areaServed is just "AE".
  - No shared Organization/WebSite `@id` graph.
  - Article should be BlogPosting with a real author.
  - sameAs mixes in the Cart brand and the wrong LinkedIn.

The findings file includes ready-to-use JSON-LD snippets.

### Performance — 70 / Images — 74 → `findings/performance.md`

Lab data from Lighthouse mobile, one run per page. No CrUX field data was available.

| Page | Perf | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| / | 78 | 3.5 s | 4.3 s | 50 ms | 0 |
| /services | 80 | 3.2 s | 4.1 s | 0 ms | 0 |

- **Works:** Brotli compression, next/image with WebP, CLS 0, no legacy jQuery loaded, modest page weight.
- **Issues:**
  - Render-blocking Google Fonts (about 2 s of FCP).
  - The hero lacks `fetchpriority`, and AVIF is off.
  - Content routes are uncached, with a US-East function region.
  - The sonner Toaster ships on every public page.
  - Some source images are low-resolution and get upscaled.

### AI Search Readiness — 43 → `findings/geo.md`
- **Works:** every AI crawler gets 200. llms.txt is valid. The home FAQ is highly citable.
- **Issues:**
  - Wrong LinkedIn entity.
  - Flagship posts are stubs.
  - Brand split with LockShield Cart.
  - No Wikidata, YouTube or GBP signals.
  - Bing indexing unconfirmed.
  - llms.txt is truncated.
  - robots.txt named groups bypass the `/admin/` disallow.

### Local SEO — 36 → `findings/local.md`
- **Works:** phone and email are consistent on the site, with tel: and wa.me links. LocalBusiness schema is present. Listings exist on 2GIS, Yango, Yandex, LinkedIn and Facebook.
- **Issues:**
  - No GBP found via search.
  - PO Box only, with no building address.
  - Conflicting NAP across citations.
  - Almost no reviews.
  - No emirate or area pages.
  - DCD approval is claimed but not shown.
- **Competitors:**
  - AITS Safety: 336 reviews, a dedicated fire-alarm page and full LocalBusiness schema.
  - Stevok: one page per system.
  - Eurofire: "A+ and DCD approved" in its titles and 5+ Sharjah pages.

### Mobile / Visual — 76 → `findings/visual.md` + `screenshots/`
- **Works:** no horizontal scroll, 16px base font, no popups, CLS about 0, correct tel: and WhatsApp links.
- **Issues:**
  - No phone or call CTA above the fold on mobile home.
  - No visible DCD badge.
  - 16 tap targets under 44px.
  - 10–11px micro text.
  - 14px inputs, which trigger iOS zoom.
  - The floating chat button overlaps text.

### Sitemap — 72 → `findings/sitemap.md`
- **Works:** valid XML, 77 URLs, all 200, canonical-consistent, complete coverage, pagination correctly excluded.
- **Issues:** duplicate and thin posts listed, fake lastmod (`new Date()` and the import timestamp), no image entries, and out-of-range `/blog?page=N` returns 200.

## Limits of this audit
- **No field data.** No Google Search Console, GA4, CrUX, DataForSEO or backlink API access was configured. Performance is lab-only, from one run per page. Indexing status and real rankings were not measured.
- **GBP not inspected.** Google Maps could not be rendered, so Business Profile existence, category and review counts are not confirmed. Some directory checks were rate-limited.
- **LinkedIn not re-checked here.** The wrong-company finding comes from the AI search check. It was not re-opened during this write-up, so please confirm it in a browser.
- **Word counts differ between checks.** Some counts include nav and footer text and some don't. Both methods flag the same pages as thin.

## Files
- `ACTION-PLAN.md`: prioritised tasks by phase and owner.
- `findings/technical.md`, `content.md`, `schema.md`, `performance.md`, `visual.md`, `geo.md`, `local.md`, `sitemap.md`.
- `screenshots/`: mobile (375px) and desktop (1440px) captures of 5 pages.
- `audit-data.json`: structured summary.
- `urls.txt`: audited URL list.
