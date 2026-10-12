# AI Search Readiness (GEO) — www.lockshield.ae

Audited 2026-10-12. Score: **43 / 100**

| Dimension | Score | Weight |
|---|---|---|
| Citability | 38 | 25% |
| Structural readability | 50 | 20% |
| Multi-modal | 30 | 15% |
| Authority & brand | 25 | 20% |
| Technical accessibility | 72 | 20% |

Platform estimates: Google AI Overviews ~50, Perplexity ~45, ChatGPT search ~35 (Bing indexing unconfirmed), Bing Copilot ~30.

## What works
- All AI and search bot user agents (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot, Applebot, CCBot, Meta-ExternalAgent) get HTTP 200 with identical bodies. There is no WAF or challenge page.
- robots.txt allows everything except /admin/ and /api/, and lists the sitemap.
- llms.txt returns 200 as text/plain, follows the llmstxt.org layout and is generated from the database.
- The home FAQ (10 Q&As in FAQPage JSON-LD) is short, self-contained and UAE-specific. It is the most citable text on the site.
- Pages are server-rendered with canonicals and OG tags. Blog posts have Article and BreadcrumbList schema.
- Vocabulary is UAE-specific: DCD, Civil Defence, AMC, FM-200, UL-300.

## Findings

### 1. Wrong LinkedIn in sameAs (entity collision) — Critical
`LocalBusiness.sameAs` and the footer link to `https://www.linkedin.com/company/lockshield`. That page belongs to "Lockshield", a VPN company in Strasbourg, France, with 6 followers. It is not this business.
**Fix:** remove it now. Create or claim the real LinkedIn company page and use that URL (Settings → Social Profiles).

### 2. Flagship UAE posts are stubs — Critical
- The DCD approval, AMC-mandatory and FM-200 data-centre posts have about 64–66 words of body each: a duplicated excerpt plus one generic sentence.
- The DCD and AMC posts share the same second paragraph.
- Across 58 posts the median is about 347 words. 17 are under 150 words and 27 are under 300.
- The thinnest: fire-extinguisher-types (22 words), emergency-lighting-system (28), fire-alarm-system-installation (58), what-is-fire-alarm-system (56).

**Fix:** rewrite the top 5–10 posts to 800–1,500 words.
- Open each H2 with a 40–60 word direct answer.
- Use question-style H2s and a numbered DCD process.
- Cite the UAE Fire & Life Safety Code and NFPA 72/25/2001/96, and link the DCD portal.
- Include real figures and dates.

### 3. Service pages are templated and thin — High
All 6 service pages have about 107–109 words of body from one template ("Lock Shield delivers certified implementation for [X] conforming strictly to DCD regulations…"). Each has one H2, no FAQ and no JSON-LD. The "100% Civil Defence Approved Guarantee" claim is unsupported.
**Fix:** 600–900 words per service. Cover:
- what it is and when it is mandatory in the UAE
- the standard that applies
- the process and timeline
- 4–6 FAQs

Add Service, FAQPage and BreadcrumbList schema.

### 4. Brand split: "Lock Shield" vs "LockShield Cart" — High
- About 30 posts and the llms.txt entries say "Lock Shield Cart" or "LOCKSHIELD CART".
- sameAs lists lockshieldcart.com, which does not link back and shows different phone numbers.
- Instagram is @lockshield_cart.
- The Article publisher is a separate Organization with no @id and a different logo.

**Fix:** decide whether the Cart is the same entity.
- If it is: add reciprocal links, the same NAP and an alternateName.
- If not: remove it from sameAs and rewrite or redirect the Cart supplier posts.
- Either way, point the publisher at `#organization`.

### 5. Weak authorship and fake-looking dates — High
The author is the Person "Lock Shield Fire Safety Engineering Desk", which is not a real person and has no credentials. Flagship posts have datePublished equal to dateModified equal to the 2026-09-23 import timestamp. No licence or DCD number is shown.
**Fix:**
- Add named authors with credentials, an author page, and Person schema.
- Show real dates.
- Show the licence and DCD numbers on the page and in schema.

### 6. Off-site brand signals near zero — High
No Wikidata or Wikipedia entries. Instagram has 42 followers. No YouTube, Facebook or Google Business Profile is in sameAs. Web mention searches were blocked, so treat mentions as likely absent.
**Fix:**
- Claim the GBP and add it to sameAs.
- Publish short YouTube videos (DCD walk-through, FM-200 demo, kitchen suppression test).
- List the business in UAE directories with identical NAP.

### 7. Bing indexing not confirmed — High
Bing `site:lockshield.ae` returned nothing (the fetcher is unreliable, so this leans negative). There is no msvalidate.01 tag, no BingSiteAuth.xml and no IndexNow key. ChatGPT search and Copilot depend on Bing.
**Fix:** verify in Bing Webmaster Tools (import from GSC), submit the sitemap, and add IndexNow. About 30 minutes.

### 8. llms.txt under-delivers — Medium
- It lists only the 20 newest posts.
- Descriptions are cut mid-word and contain raw entities (`&#8217;`).
- Project lines are skeletal.
- There are no About, Contact, FAQ, address or licence links.
- /llms-full.txt returns 404.

**Fix** in `src/app/llms.txt/route.ts`:
- Add a plain summary and About, Contact, FAQ, area and licence details.
- Select posts by quality.
- Decode entities and cut on word boundaries.

### 9. robots.txt named bot groups bypass disallows — Low
The GPTBot, PerplexityBot, ClaudeBot and Google-Extended groups have only `Allow: /`. A bot that matches a named group ignores `*`, so these four may crawl /admin/ and /api/.
**Fix** in `src/app/robots.ts`: repeat `disallow: ["/admin/", "/api/"]` in each named rule.

### 10. Duplicate and test content — Medium
Near-identical pairs: co2-fire-extinguisher-supplier-in-uae and `-2`, fire-alarm-sounders and `-2`, fire-alarm-smoke-detector-supplier-in-uae and `-2`. `/blog/test` is live, indexable and in the sitemap.
**Fix:** 301 the duplicates, retire `/blog/test`, and noindex or consolidate the thin posts.

### 11. Structure and multi-modal gaps — Medium
Only 2 of 58 posts have question-style headings. There are no tables, video or sourced statistics, and no FAQ blocks outside home.
**Fix:**
- Add comparison tables (extinguisher types, clean agent vs water).
- Add inspection-frequency tables and checklists.
- Add video.
- Add a FAQ per post.

### 12. Content streamed via Suspense; occasional slow responses — Low
The first HTML chunk holds skeletons, and the real content and Article JSON-LD arrive in later `<div hidden id="S:n">` blocks. Some cold service-page fetches took 3.5–5.2 s.
**Fix:** render primary article and service content and schema without Suspense fallbacks, and use ISR.

## Not checked
- Reddit, YouTube, news and directory mentions (search engines were blocked).
- Knowledge Panel and Google index status.
- RSL/license.xml.
- Real IP-verified crawler behaviour.
