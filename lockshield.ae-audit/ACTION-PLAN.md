# Lock Shield — SEO Action Plan

Site: https://www.lockshield.ae · Audit date: 12 Oct 2026 · Overall SEO Health Score: **49 / 100**

Owner key: **[Dev]** = code change in this repo · **[Admin]** = edit in the site admin · **[Owner]** = business task outside the website.

---

## Phase 1 — Critical fixes (this week)

| # | Task | Owner | Why it matters |
|---|---|---|---|
| 1 | **Fix legacy `.html` redirects.** `/about.html`, `/blog/fire-pump.html` and 78 other old URLs 301 to `https://lockshield-ten.vercel.app/...` instead of `https://www.lockshield.ae/...`. In `src/middleware.ts` lines 28–30, build the redirect from `SITE_URL`, not `req.nextUrl.origin`. | [Dev] | Every backlink to the old site currently passes its value to the wrong host. |
| 2 | **Stop the `lockshield-ten.vercel.app` duplicate.** Redirect that host to www, or send `noindex` on it. It is already appearing in search results. | [Dev] | It is a full duplicate copy of the site. |
| 3 | **Confirm or claim the Google Business Profile.** No listing for lockshield.ae was found via search. Set the primary category to "Fire protection service" and the website to `https://www.lockshield.ae`. Add photos, hours and services. | [Owner] | The map pack in "fire protection company dubai" comes from these profiles, not from websites. |
| 4 | **Decide one official address and use it everywhere.** The site says Hor Al Anz, Deira + PO Box 47672. YellowPages.ae says Office 174, Al Qusais with phone 04 344 0014. 2GIS says "1, 46 Street, 1st Floor". Choose the real one (building, street, area) and update the site footer, contact page, GBP and every directory. | [Owner] + [Admin] | Conflicting name, address and phone (NAP) data is a top local-ranking negative. |
| 5 | **Remove the wrong LinkedIn link.** `linkedin.com/company/lockshield` is reported to be a French VPN company. Check it, then replace it with the real company page (Settings → Social Profiles). | [Admin] | It tells Google you are a different company. |
| 6 | **Remove the 4 duplicate posts and the test post.** Unpublish the `-2` twins of co2-fire-extinguisher-supplier-in-uae, fire-alarm-sounders, emergency-light-supplier and fire-alarm-smoke-detector-supplier-in-uae, and 301 them to the originals. Rename `/blog/test` and redirect it. | [Admin] + [Dev] | Exact duplicates dilute rankings. |
| 7 | **Bing Webmaster Tools.** Import from Search Console and submit the sitemap. | [Owner] | ChatGPT search and Copilot use Bing's index. |

## Phase 2 — High-impact improvements (weeks 2–3)

| # | Task | Owner |
|---|---|---|
| 8 | **Start a review programme.** Send a Google review link or QR code with every job report, and aim for a new review at least every 2–3 weeks. Show real Google reviews on the site. Competitors have 99–346 reviews. | [Owner] |
| 9 | **Show DCD proof.** Publish the DCD contractor class and number, the certificate image and the trade licence number on home, about and service pages, and in the schema. Competitors put "A+ / DCD Approved" in their titles. | [Owner] + [Dev] |
| 10 | **Add a call/WhatsApp bar and a DCD badge above the fold on mobile.** Today the home hero shows neither the phone nor a visible approval badge. | [Dev] |
| 11 | **Service schema.** Add Service + BreadcrumbList JSON-LD to all `/services/*` pages (`buildServiceSchema` already exists but is never called). Make LocalBusiness `["HomeAndConstructionBusiness","ProfessionalService"]` with geo, opening hours, areaServed for each emirate and all phones. Add geo and hours fields to Settings. | [Dev] |
| 12 | **Fix the home H1.** It reads "CompleteFire ProtectionSolutionsYou Can Trust" (no spaces) and has no keyword. Add spaces and use e.g. "Civil Defence Approved Fire Protection Company in Dubai". | [Dev] |
| 13 | **Speed: self-host fonts and prioritise the hero image.** Google Fonts `<link>` costs about 2 s of first paint on mobile. Mobile LCP is 4.1–4.3 s, which counts as poor. Add `fetchPriority="high"` on the hero and enable AVIF. | [Dev] |
| 14 | **Cache content pages.** `/services`, `/services/*`, `/projects`, `/blog/*` render on every request (`no-store`). Use ISR with `revalidate`. | [Dev] |
| 15 | **Internal links.** 49 of 58 posts get no links from anywhere. Add 3–5 contextual links per post (matching service, a project, related posts) and related-post modules. | [Dev] + [Admin] |
| 16 | **Titles and descriptions.** 43 titles are over 60 characters, and blog descriptions are cut mid-word with `&#8217;` entities. Use the pattern "[Service] in Dubai \| Lock Shield" and write a real 140–155 character description per page. | [Admin] + [Dev] |

## Phase 3 — Content & authority (month 2)

| # | Task | Owner |
|---|---|---|
| 17 | **Rewrite the 6 service pages** to 800–1,200 words each. Cover scope, the standards that apply (UAE Fire & Life Safety Code, NFPA 72/13/2001/96), process and timeline, certificates issued, 5–8 FAQs and linked projects. | [Owner/writer] |
| 18 | **New service pages** for searches you have no page for: Fire Alarm Installation, Sprinkler & Hydrant Systems, Fire Pumps, Fire Extinguisher Maintenance, Emergency Lighting. | [Owner/writer] + [Admin] |
| 19 | **Area pages** for Sharjah, Abu Dhabi and Ajman, with real projects there and which authority approves work in each. | [Owner/writer] |
| 20 | **Project case studies.** Turn the six 60-word project pages into 400–600 word studies with photos, systems installed, the DCD certificate and a client quote. | [Owner] |
| 21 | **Fix the blog.** Expand or merge the 17 posts under 300 words. Rewrite the 3 newest "guide" posts (DCD approval, AMC, FM-200), which are about 120 words each. Fix the spun text ("Try not to Hang tight for Calamity…"). Merge the about 20 overlapping "supplier in UAE" posts into a few pillar pages. | [Owner/writer] |
| 22 | **Settle Lock Shield vs LockShield Cart.** About 25 posts are written as "LockShield Cart". Decide the relationship. Either rebrand those posts, or link the two sites both ways with consistent details. | [Owner] |
| 23 | **Real authors.** Named engineers with credentials, an author page and "Reviewed by" lines, replacing "Fire Engineering Desk". | [Owner] + [Dev] |
| 24 | **Citations.** Claim and correct YellowPages.ae, 2GIS, ReachUAE, LinkedIn and Facebook. Add Hidubai, Connect.ae, Dubai Chamber and Etisalat Yellow Pages. | [Owner] |
| 25 | **YouTube.** Short videos such as an FM-200 discharge test, kitchen suppression test and DCD approval walk-through. | [Owner] |

## Phase 4 — Monitoring (ongoing)

- **Search Console:** the Pages report (indexed count should approach the number of real pages), Performance (queries and positions), and the Sitemaps status.
- **Re-run the audit** in 6–8 weeks after Phases 1–2.
- **Sitemap dates:** use real `updatedAt` values, stop using `new Date()` for static pages, and drop changefreq/priority (`src/app/sitemap.ts`).
- **Lower priority technical items:** robots.txt named bot groups should repeat the `/admin/` and `/api/` disallows. Improve llms.txt (decode entities, add About/Contact/FAQ). Drop HSTS `preload` or configure the apex. Remove unused files in `public/assets/vendors` (5.4 MB). Fix 22 pages missing og:image.

---

### Why "fire protection company dubai" doesn't show you yet
1. The top box is the Google Maps pack. It ranks Business Profiles by relevance, distance and prominence, where prominence is mostly reviews. No profile for lockshield.ae was found via search, and competitors have 99–346 reviews.
2. The organic results are NAFFCO, Al Shirawi, AITS and similar. They have years of backlinks and long service pages. Your service pages are about 140 unique words each.
3. Today's www/canonical fix removed a blocker but adds no ranking strength. Expect narrower searches (e.g. "FM-200 maintenance Dubai", "kitchen fire suppression Dubai") to move first, about 4–12 weeks after Phases 1–3.
