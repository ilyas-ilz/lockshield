# Content Quality & On-Page SEO — www.lockshield.ae

Audited 2026-10-12. All 77 sitemap URLs were fetched (all returned 200).

| Score | Value |
|---|---|
| Content Quality | **27 / 100** |
| On-Page SEO | **41 / 100** |
| E-E-A-T (estimate) | ~30 (Experience 15, Expertise 30, Authoritativeness 25, Trust 45) |
| AI-citation readiness | ~20 |

> Word counts in the table below are visible text including the quote form, nav crumbs and cross-links. Unique body copy is lower: about 140 words on service pages, hand-counted. The visible text of /about and /contact was not reviewed in detail. Items marked *(sampled)* were not computed over every page.

## What works
- Every page returns 200, has a self-referencing canonical, exactly one H1, a brand-suffixed title and OG/Twitter tags (en_AE).
- All 58 posts have Article and BreadcrumbList JSON-LD. Home has LocalBusiness and FAQPage JSON-LD.
- Home has 946 words and a real FAQ.
- Service pages are named after real, searchable services. Every page has a quote form or WhatsApp CTA.
- Four long posts (1,581–2,195 words) have structured sections. The three newest titles are specific and on-topic.

## Findings

### 1. Service pages are thin template stubs — Critical
Six pages have 202–209 words each, about 140 of them unique: one intro sentence, six bullets and a guarantee box. The skeleton is identical across all six.
**Fix:** 800–1,200 unique words each, covering:
- scope
- standards (NFPA 72/13/2001, UAE Fire & Life Safety Code, DCD)
- process and timeline
- certificates issued
- price drivers
- 5–8 FAQs
- 2–3 linked case studies

Add a named engineer reviewer and Service schema.

### 2. Blog is mostly thin placeholder text — Critical
- 17 of 58 posts are under 300 words, and 14 of those are under 150.
- Examples: fire-extinguisher-types (70), emergency-lighting-system (78), fire-protection-companies-in-dubai (101), what-is-fire-alarm-system (113).
- The three newest posts (FM-200, AMC, DCD; 23 Sep 2026) have 119–127 words that share one generic paragraph, with about 53% overlap.

**Fix:** expand those three to 1,500+ words with real specifics:
- DCD steps and document list
- inspection intervals
- costs and timelines
- a worked example

Merge or 301 the sub-150-word stubs into pillar pages, and noindex anything that won't be rewritten.

### 3. Four exact-duplicate post pairs (8 URLs) — High
Same title, description and body (similarity 0.92–0.99), each with a self-canonical:
- co2-fire-extinguisher-supplier-in-uae
- fire-alarm-sounders
- emergency-light-supplier
- fire-alarm-smoke-detector-supplier-in-uae

Each of these has a `-2` twin.
**Fix:** keep one of each pair, 301 the `-2` slug (or unpublish it so it leaves the sitemap).

### 4. Keyword cannibalisation — High
- About 20 "[product] supplier in UAE" posts.
- 8+ fire-pump posts, 4 CO2 posts, 3 hose-reel posts and 3 fire-alarm-cable posts.
- 3 DCD-approval pages compete: two posts plus the service page.
- The AMC, FM-200 and kitchen posts each compete with their own service page.

**Fix:** one target page per query. Merge each product family into a pillar page. The service page owns the head term, and posts link up to it with keyword anchors.

### 5. Internal linking is broken — High
- 49 of 58 posts have zero inbound links from any page. Only 9 are linked, from the /blog index.
- Blog bodies have 0 links to services, projects or other posts.
- Service pages link only to each other. Projects have 1–2 inbound links each.

**Fix:**
- Make /blog pagination crawlable.
- Add 3–5 contextual links per post: the matching service (keyword anchor), a project and two sibling posts.
- Add "related" modules, and link projects from service pages.

### 6. E-E-A-T: anonymous authorship, unverifiable credentials — High
The byline is "Lock Shield Fire Engineering Desk", but the JSON-LD author is a Person named "Lock Shield Fire Safety Engineering Desk". That isn't a real person, and the two strings don't match. There are no author pages, bios or outbound citations. No licence number, DCD approval number, certificate images, founding year or named engineers appear on the pages checked.
**Fix:**
- Named engineers with their DCD licence, years of experience, photo and LinkedIn, plus author pages, "Reviewed by" lines and Person schema.
- Publish the trade licence and DCD numbers, certificates, founding year and project count.
- Cite NFPA, the UAE Code and DCD sources.

### 7. Project pages carry almost no content — High
The six pages have 58–64 words each: client, location, year and one sentence.
**Fix:** 400–600 word case studies covering:
- the system installed (make, quantities, UL/FM listing)
- the DCD certificate image
- site photos with alt text
- duration
- a client quote

### 8. Head-query intent gaps — High
- There is no service page for fire alarm installation, sprinklers/hydrants, fire pumps or "fire protection company Dubai". Those topics exist only as 100–150 word blog stubs.
- Service titles omit "Dubai".

**Fix:** build commercial pages for those topics, titled "[Service] in Dubai | DCD Approved | Lock Shield".

### 9. Brand identity split — High
"Lock Shield Cart", "LockShield Cart", "Lockshieldcart" and "LOCKSHIELD CART" appear in 25+ posts. One title is 147 characters and names two brands. The content reads as if migrated from a supplier shop.
**Fix:** choose one public brand and find/replace in the CMS. If lockshieldcart.com is a separate shop, explain that once on /about and link to it.

### 10. Spun, low-quality text and factual errors — High
- A title reads "Try not to Hang tight for Calamity: How DCP Fire Extinguishers…"
- A description reads "Ongoing data proposes that recently there has been an expansion in fire mishaps".
- Another description says "non-neglide negligible aspect".
- An FM-200 post says "without zero residue".
- A fire-alarm article mentions an "effective lightning detection system".

**Fix:** have a licensed engineer rewrite or review every retained post, correct these errors, and add real job specifics and photos.

### 11. Meta descriptions truncated, double-encoded or short — Medium
- About 55 blog descriptions are the first 154–155 characters of the body, cut mid-word (e.g. ending "…isn&#8217;" or "…Non-").
- `&amp;#8217;` is double-encoded in at least 4 posts.
- The duplicate pairs share descriptions.
- Service descriptions are 104–124 characters and project descriptions 85–100.

**Fix:** unique 140–155 character descriptions that end in a full sentence and include Dubai, the service and a CTA. Use the SEO description field, not an excerpt slice. Decode entities before saving.

### 12. Title tags over-long and inconsistent — Medium
- About 43 of 77 titles are over 60 characters, 8 are over 100, and the longest is 147.
- The duplicate pairs have duplicate titles.
- One title is all lowercase.
- `/blog/test` is titled "Fire Alarm Companies in Dubai".
- One slug has a typo (`understanding-exit-lights-nsuring-…`).

**Fix:** 50–60 characters in the form "[Keyword] in Dubai | Lock Shield". 301 `/blog/test` and the typo slug.

### 13. Homepage H1 runs together and has no keyword — Medium
The raw HTML has 4 adjacent `<span class="hero-line">` elements with no whitespace, so the text reads "CompleteFire ProtectionSolutionsYou Can Trust". The H1 contains no Dubai, Civil Defence or service term.
**Fix:** add `{" "}` between the spans, and retitle to e.g. "Civil Defence Approved Fire Protection Company in Dubai".

### 14. Heading hierarchy — Medium *(sampled)*
- Long posts use H3 for every section and have no H2.
- The footer H3s ("Quick Links", "Get in Touch") come before the H1 in DOM order.
- best-safety-products repeats sections.
- Service pages have only an H1.

**Fix:**
- Use H2 for sections and H3 for sub-points.
- Make the footer titles non-headings.
- Add H2s to service pages (Scope, Standards, Process, FAQs, Projects).

### 15. No FAQs or Service schema on money pages — Medium
FAQPage appears only on home.
**Fix:** 5–8 visible Q&As per service page, plus Service schema with areaServed. Add street address, geo and openingHours to LocalBusiness.

### 16. Readability and citation-readiness are weak — Medium *(sampled)*
- Paragraphs run 120–200 words, with no lists, tables or steps.
- Every post shows "5 min read", even the 70-word ones.
- The excerpt is printed as the lede and then repeated as the first paragraph (5 of 5 sampled).

**Fix:**
- Open each section with a one-sentence answer.
- Keep paragraphs to 2–4 sentences.
- Add bullets, tables and steps.
- Compute read time from the text.
- Stop repeating the excerpt.

### 17. Fake freshness signals — Low
All 58 Article `dateModified` values are 2026-09-23T10:03 (the bulk import). The 2024 regulatory post "New Regulation: Fire Alarms Now Mandatory for All UAE Homeowners" has not been revised.
**Fix:** set dateModified only on real edits, and show "Last reviewed by [name]". Refresh or remove old regulatory claims, with citations.

### 18. Trust and CTA signals are generic — Low
Every post ends with the same CTA, which doesn't name the service discussed. There are no named reviews tied to projects.
**Fix:** service-specific end-of-post CTAs, and named reviews linked to project pages.

## Page table
Columns: path, title length, meta description length, words (visible text). Every page has one H1. A description length of 154 or 155 means it was cut mid-sentence.

| # | Path | Title | Desc | Words |
|---|---|---|---|---|
| 1 | / | 65 | 164 | 946 |
| 2 | /about | 67 | 148 | 203 |
| 3 | /services | 51 | 131 | 147 |
| 4 | /projects | 47 | 154 | 94 |
| 5 | /blog | 53 | 117 | 417 |
| 6 | /career | 40 | 147 | 89 |
| 7 | /contact | 64 | 156 | 106 |
| 8 | /blog/protecting-data-centers-fm-200-clean-agent-suppression | 95 | 135 | 125 |
| 9 | /blog/why-annual-maintenance-contracts-amc-mandatory-uae | 90 | 143 | 127 |
| 10 | /blog/understanding-dubai-civil-defence-approval-commercial-fitouts | 90 | 138 | 119 |
| 11 | /blog/your-complete-guide-to-fire-safety-equipment-… | 129 | 154 | 1095 |
| 12 | /blog/fire-alarm-sounders-and-fire-alarm-cables-suppliers-… | 101 | 155 | 1223 |
| 13 | /blog/reliable-fire-safety-starts-here-non-ul-listed-… | 116 | 155 | 1410 |
| 14 | /blog/uaes-trusted-fire-pumps-supplier-and-servicing-… | 147 | 154 | 1831 |
| 15 | /blog/trusted-fire-alarm-smoke-detector-supplier-in-uae-… | 143 | 155 | 1626 |
| 16 | /blog/top-fire-extinguisher-cabinets-fire-hose-reels-… | 100 | 155 | 1436 |
| 17 | /blog/protect-your-building-with-certified-fire-rated-doors-… | 121 | 155 | 1289 |
| 18 | /blog/why-every-building-needs-the-right-fire-safety-equipment-a-complete-guide | 92 | 154 | 1581 |
| 19 | /blog/emergency-light-cable-supplier-in-uae | 55 | 155 | 1087 |
| 20 | /blog/fire-extinguisher-covers-for-commercial-and-industrial-use-in-uae | 83 | 155 | 1117 |
| 21 | /blog/co2-fire-extinguisher-supplier-in-uae-everything-you-need-to-know-… | 111 | 155 | 1324 |
| 22 | /blog/uae-fire-alarm-and-fire-fighting-fit-out-services-for-all-properties | 86 | 155 | 1074 |
| 23 | /blog/trusted-fire-rated-doors-supplier-in-uae-for-reliable-fire-safety | 83 | 155 | 1045 |
| 24 | /blog/kitchen-suppression-system-products-for-reliable-fire-safety-in-uae | 85 | 154 | 1096 |
| 25 | /blog/best-safety-products-supplier-in-uae-for-fire-gas-workplace-protection | 91 | 155 | 2195 |
| 26 | /blog/fire-safety-starts-here-expert-hose-reel-cabinets-supplier-in-uae | 84 | 155 | 1063 |
| 27 | /blog/ul-listed-fire-pumps-supplier-in-uae-lock-shield-cart | 81 | 155 | 1159 |
| 28 | /blog/durable-fire-alarm-cables-supplier-in-dubai-with-fast-delivery | 80 | 155 | 1096 |
| 29 | /blog/non-ul-listed-fire-pump-key-considerations-before-you-choose-one | 83 | 155 | 1193 |
| 30 | /blog/why-fire-pumps-fail-and-how-proper-servicing-prevents-it | 74 | 155 | 1114 |
| 31 | /blog/fire-alarm-battery-supplier-in-uae-lock-shield-cart | 45 | 155 | 1021 |
| 32 | /blog/extinguisher-stands-supplier-fire-safety-solutions | 46 | 155 | 1073 |
| 33 | /blog/co2-fire-extinguisher-supplier-in-uae-2 | 55 | 155 | 1067 |
| 34 | /blog/fire-alarm-sounders-2 | 37 | 155 | 1084 |
| 35 | /blog/emergency-light-supplier-2 | 42 | 155 | 1116 |
| 36 | /blog/fire-alarm-smoke-detector-supplier-in-uae-2 | 59 | 155 | 1157 |
| 37 | /blog/co2-fire-extinguisher-supplier-in-uae | 55 | 155 | 1067 |
| 38 | /blog/emergency-light-supplier | 42 | 155 | 1112 |
| 39 | /blog/fire-alarm-smoke-detector-supplier-in-uae | 59 | 155 | 1157 |
| 40 | /blog/fire-alarm-sounders | 37 | 155 | 1084 |
| 41 | /blog/benefits-of-fire-alarm-system-in-uae | 54 | 155 | 136 |
| 42 | /blog/emergency-lighting-system | 43 | 155 | 78 |
| 43 | /blog/fire-alarm-system-installation | 48 | 155 | 110 |
| 44 | /blog/fire-detection-and-notification-system | 56 | 155 | 101 |
| 45 | /blog/fire-pump | 27 | 155 | 147 |
| 46 | /blog/sprinkler-systems | 35 | 155 | 138 |
| 47 | /blog/suppression-and-special-hazard-systems | 56 | 155 | 130 |
| 48 | /blog/best-fire-alarm-system-in-uae | 47 | 154 | 131 |
| 49 | /blog/fire-protection-companies-in-dubai | 52 | 155 | 101 |
| 50 | /blog/test | 47 | 154 | 163 |
| 51 | /blog/what-is-fire-alarm-system | 44 | 154 | 113 |
| 52 | /blog/why-fire-alarm-system-is-important | 53 | 155 | 203 |
| 53 | /blog/morley-fire-alarm-supplier-in-uae-why-lockshieldcart-is-the-best-supplier | 92 | 155 | 767 |
| 54 | /blog/safety-first-why-lock-shield-cart-stands-out-in-fire-safety-equipment | 88 | 155 | 569 |
| 55 | /blog/understanding-exit-lights-nsuring-safety-and-compliance-… | 110 | 155 | 908 |
| 56 | /blog/new-regulation-fire-alarms-now-mandatory-for-all-uae-homeowners | 82 | 155 | 731 |
| 57 | /blog/the-role-and-impact-of-fire-pump-rectification-on-fire-safety-in-uae | 86 | 155 | 552 |
| 58 | /blog/choosing-the-right-extinguisher-for-oil-and-gas-facilities | 76 | 155 | 552 |
| 59 | /blog/try-not-to-hang-tight-for-calamity-how-dcp-fire-extinguishers-in-uae-can-save-lives | 102 | 155 | 480 |
| 60 | /blog/your-guide-to-fire-safety-and-fire-extinguishers | 66 | 155 | 648 |
| 61 | /blog/how-to-get-dcd-approval-for-restaurants-and-other-fit-outs-in-uae | 83 | 155 | 529 |
| 62 | /blog/lockshieldcart-your-go-to-source-for-fire-and-flood-safety-in-the-uae | 88 | 155 | 595 |
| 63 | /blog/what-is-the-most-important-fire-safety-and-prevention-tips-for-the-home | 89 | 155 | 249 |
| 64 | /blog/protect-your-home-and-business-with-fire-alarms | 65 | 155 | 605 |
| 65 | /blog/fire-extinguisher-types | 41 | 155 | 70 |
| 66 | /services/annual-maintenance-contract | 51 | 122 | 204 |
| 67 | /services/designing-drawing-civil-defence-approval | 61 | 105 | 203 |
| 68 | /services/fm-200-special-systems | 57 | 124 | 206 |
| 69 | /services/kitchen-fire-suppression-systems | 50 | 116 | 202 |
| 70 | /services/fire-extinguisher-refilling | 55 | 105 | 205 |
| 71 | /services/fire-system-products-supply | 55 | 104 | 209 |
| 72 | /projects/feetlab | 60 | 91 | 58 |
| 73 | /projects/the-grey-restaurant | 66 | 91 | 61 |
| 74 | /projects/al-manara-pharmacy | 65 | 100 | 64 |
| 75 | /projects/emirates-nbd | 70 | 96 | 63 |
| 76 | /projects/farsi-restaurant | 75 | 90 | 63 |
| 77 | /projects/pizza-hut | 71 | 85 | 61 |
