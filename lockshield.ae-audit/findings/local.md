# Local SEO Audit - lockshield.ae

Audit date: 2026-10-12. Scope: https://www.lockshield.ae plus third-party listings. Read-only. No forms submitted.

## Local SEO Score: 36 / 100

| Dimension | Weight | Score | Basis |
|---|---|---|---|
| GBP Signals | 25 | 7 | Google Business Profile: not found via search. Maps iframe on /contact is an address-query embed, not a place embed. No GBP link, place ID, or "leave a review" link on site. |
| Reviews & Reputation | 20 | 5 | 4 static, undated testimonials on home. No review widget, no aggregateRating. 0 reviews on Yandex/Yango/2GIS/Facebook. |
| Local On-Page SEO | 20 | 10 | Dubai/DCD in home, contact, services titles. Service titles lack "Dubai". No area pages. 6 service pages only. |
| NAP Consistency & Citations | 15 | 6 | On-site phone/email consistent. Address lacks building. 5+ directories carry conflicting addresses/phones. |
| Local Schema | 10 | 4 | LocalBusiness on home only. No geo, hours, region. Service schema builder exists but is unused. |
| Local Link & Authority | 10 | 4 | Listings on 2GIS, Yango, Yandex, LinkedIn link to lockshield.ae. Several are unclaimed or thin. |

Proximity note: proximity is about 55% of local ranking variance and cannot be changed. The Hor Al Anz (Deira) location is a fixed constraint.

## Business type and vertical
- Type: service-area business with an office (hybrid). Footer and contact show "Hor Al Anz, Deira, Dubai" and PO Box 47672. Copy claims all seven emirates. Contact page has a Maps iframe.
- Vertical: Home Services / commercial fire protection contractor (installation, AMC, DCD drawings, FM-200, kitchen suppression, extinguisher refilling).
- Schema.org has no fire-protection-specific subtype. Site uses generic `LocalBusiness`.

## NAP audit (source comparison)

| Source | Address | Phone | Website | Hours |
|---|---|---|---|---|
| Footer (all 8 pages checked) | Hor Al Anz, Deira, Dubai, UAE (no PO Box, no building) | +971 4 272 7333; +971 52 843 4801 (tel: links present) | - | - |
| /contact | PO Box 47672 + "Hor Al Anz, Deira, Dubai, UAE" | same; only first phone shown | - | Mon-Sat 8-6 (hard-coded at contact/page.tsx:135) |
| JSON-LD (home only) | streetAddress "Hor Al Anz, Deira", PO Box 47672, Dubai, AE | +971 4 272 7333 | lockshield.ae | none |
| 2GIS | 1, 46 Street, 1st Floor, Hor Al Anz, Deira | +971 52843... (truncated) | lockshield.ae | 9-6; 1 photo; no reviews |
| Yango / Yandex Maps | 1, 46 Street, Hor Al Anz, Deira | +971 5 28434801 | lockshield.ae | unknown; 0 reviews |
| ReachUAE | Office No 2, Al Zarooni Building, near Abu Baker Al Siddique St (Siddique Metro), Hor Al Anz | WhatsApp +97154998XXXX (masked) | none | - |
| YellowPages.ae | Office No 174, King Sheikha Mahra Ahmed Al Ghrair, Al Qusais Industrial Area | WhatsApp link 97143440014 | none; "Claim Business" shown (unclaimed) | Mon-Sun, no times |
| LinkedIn | Damascus Street, Al Qusais, Dubai 0132 | none | lockshield.ae | 155 followers; 2-10 staff |
| Facebook | "Al Qusais, Dubai" (search snippet); page fetch returned no detail | none | lockshield.ae (snippet) | "Not yet rated (0 reviews)" |
| Prospeo (aggregator) | Dubai International Airport | - | - | likely junk data |
| Sister site lockshieldcart.com | Office 2, Abdul Rahim Mohd Al Zarooni Building, Hor Al Anz | +971 54 581 5314; +971 4 570 3455 | own site | Mon-Fri 9-8, Sat 10-5 |

Discrepancies:
1. The street-level address is missing from lockshield.ae. Third parties show "Office 2, Al Zarooni Building" (ReachUAE, and the same building on the sister Cart site) and "1, 46 Street, 1st Floor" (2GIS/Yango/Yandex). Which is canonical needs owner confirmation.
2. Two location "eras": Hor Al Anz (Deira) vs Al Qusais (LinkedIn, Facebook, YellowPages.ae).
3. Hours differ: 8-6 on site, 9-6 on 2GIS, 8-5 in a search-engine snippet of an older page version. The Cart site uses different hours.
4. Phone numbers differ. YellowPages.ae lists 97143440014. ReachUAE's masked number matches the Cart header (+971 54 998 5432). The Cart header shows 54 998 5432 but its tel: link dials 54 581 5314.
5. The repo seed and footer fallback include a third phone (+971 54 581 5314, the Cart's number). The live footer does not show it. Settings drive NAP, so check it is not added to the lockshield.ae footer by mistake.

## GBP checklist
| Item | Status |
|---|---|
| GBP listing (Google Maps) | Not found via search (Brave queries for brand, "Lock Shield Dubai fire", "Lock Shield Firefighting"). Google Maps itself could not be rendered. |
| Hint a Google listing exists | lockshieldcart.com shows a Trustindex widget: "EXCELLENT, based on 9 reviews", source Google. At least one review describes firefighting installation work. A listing named "Lock Shield" likely exists, but its URL, category, and website link are unconfirmed. |
| Maps embed | Present on /contact, but a query embed (`google.com/maps?q=<address>&output=embed`), not a place embed. |
| Directions link | Present (Maps search URL). Not a place/CID link. |
| GBP link / review link / place ID on site | Missing |
| Primary category | Cannot be assessed. Wrong primary category is the #1 negative ranking factor, so verify it. |
| Website link in GBP = https://www.lockshield.ae | Unconfirmed. 2GIS, Yango, Yandex, LinkedIn do link to lockshield.ae. |
| Posts, photos, Q&A | Not assessable. 2GIS shows 1 photo. |

## Reviews snapshot
- On-site: 4 static testimonials (named roles, no dates, no source links). No Google/Trustindex widget. No aggregateRating in schema.
- Google: 9 reviews seen only on the sister Cart site's widget. Rating, velocity, and owner-response rate are not assessable.
- Other platforms: Facebook "0 reviews", Yandex/Yango 0, 2GIS none shown.
- Benchmark: AITS Safety (competitor) shows "336 Google reviews" on its homepage.

## Citations (UAE, Tier 1)
| Directory | Status | Notes |
|---|---|---|
| 2GIS | Found | Address plausible, website set, no reviews |
| Yango Maps / Yandex Maps | Found | 0 reviews |
| ReachUAE | Found | Different building descriptor, no website |
| YellowPages.ae | Found, unclaimed | Wrong address (Al Qusais) and phone; no website |
| LinkedIn | Found | Al Qusais HQ address (outdated?) |
| Facebook | Found | Stub page, 0 reviews |
| Hidubai, Connect.ae, Dubai Chamber, e& (Etisalat) yellow pages, Cylex, Dubai Civil Defence approved-contractor list | Not found via search / not verified | Directory-specific searches were rate-limited (HTTP 429); treat as unverified, not confirmed absent |
| Yelp, BBB | Not relevant for UAE | - |

## Schema validation (home page JSON-LD, raw HTML confirmed)
- Present: `LocalBusiness` with @id, name, alternateName (Lock Shield, Lockshield, Lock Shield Fire Safety), url, logo, image, telephone, email, PostalAddress (PO Box, street, locality, country), areaServed "AE", sameAs (Instagram, LinkedIn, lockshieldcart.com). Plus `FAQPage`.
- Missing: `geo` (code supports it, src/app/(public)/page.tsx:179-184, but it is only emitted when Settings lat/lng exist; sections.test.ts:23 indicates no admin field for geo.lat), `openingHoursSpecification` (no hours field in Settings or OrgInput), `addressRegion`, named `areaServed` per emirate, Facebook/2GIS/GBP in sameAs.
- `streetAddress` merges area into one string ("Hor Al Anz, Deira"). No building or street.
- No LocalBusiness on /contact or /about. No Service schema on any service page (`buildServiceSchema` in src/lib/seo/jsonld.ts is never called). BreadcrumbList only on blog posts.
- Do not add self-written aggregateRating to LocalBusiness. Google treats it as self-serving and it will not produce stars. Show a real review widget for conversion instead.

## Location and service page quality
- 6 service pages: AMC, DCD design/drawing approval, FM-200, kitchen suppression, extinguisher refilling, product supply. Titles read "<Service> | Lock Shield UAE" with no "Dubai".
- No dedicated pages for fire alarm installation, sprinkler/firefighting systems, fire pumps, or emergency lighting. These exist only as blog posts. "Fire alarm installation Dubai" is a core query, and dedicated service pages are the #1 local organic factor.
- No emirate or neighbourhood pages. Sharjah/Abu Dhabi/Ajman appear only in the homepage FAQ text and JSON-LD FAQ. The AMC service page has zero mentions.
- Blog hygiene: /blog/test is live (title "Fire Alarm Companies in Dubai"), "-2" duplicate slugs exist, and many posts are Lock Shield Cart supplier posts, which blurs the contractor vs retailer intent.
- Doorway risk: emirate pages must carry unique content (projects, authority process, response times), not swapped city names.

## Industry factors (UAE fire protection)
- Claim present: "DCD Approved Contractor Company licensed by Dubai Civil Defence". Missing: approval class/grade (competitors state "A+ Grade" or "A-Category"), DCD registration/licence number, certificate image/PDF, trade licence number, Hassantuk/NFPA/UL certifications on the page.
- DCD is Dubai-specific. Copy claiming all seven emirates should state which authority approvals apply outside Dubai.
- The hotline is labeled 24/7 but footer/contact hours are Mon-Sat 8-6. Make the 24/7 on-call promise explicit in GBP hours and schema.

## Competitors (Brave SERP, geo-localised to Dubai; Google's own local pack was not observable)
1. AITS Safety LLC (aitsgulf.com): organic top-3 for "fire alarm installation Dubai", also in results for "fire protection company Dubai". Al Qusais address. LocalBusiness + GeoCoordinates + OpeningHoursSpecification + Service schema. Google reviews widget showing 336 reviews. Dedicated /fire-alarm-system/ page.
2. Stevok (stevok.ae): in the Brave local pack (Al Quoz) and organic top-5 for fire alarm. One dedicated page per system (addressable/conventional alarm, fire fighting).
3. Eurofire (eurofire.ae): "A+ and DCD approved" in its title tag, 5+ Sharjah landing pages, separate Dubai and Sharjah phone numbers.
Also seen: Petrosafe (#1 organic for fire alarm companies), Al Shirawi (#1 organic for fire protection), Delmont ("A+ Grade"), Phoenix ("A-Category"), Emirates Fire & Rescue.

## Top 10 prioritized actions
1. Critical - Confirm or claim the Google Business Profile (not found via search), set the primary category, add the website link, and link it from the site.
2. Critical - Publish the full street address (building, office, street, area) and one canonical hours set; make footer, contact, JSON-LD, GBP, and directories identical.
3. High - Fix the citation set: claim and correct YellowPages.ae (Al Qusais address, wrong phone), ReachUAE, 2GIS; update LinkedIn and Facebook; ask Prospeo to correct.
4. High - Launch a Google review program (review link, QR on service reports, target a new review inside every 18 days) and embed a real Google reviews widget. Add dates and sources to the testimonials.
5. High - Add dedicated service pages: fire alarm installation Dubai, sprinkler/firefighting systems, fire pumps, emergency lighting. Add "Dubai" to service titles.
6. High - Show DCD proof: class/grade, registration number, certificate image, trade licence number.
7. Medium - Complete the schema: add geo (5 decimals), openingHoursSpecification, addressRegion, named areaServed per emirate. Emit `Service` on service pages. Add LocalBusiness/ContactPage on /contact. Add a Settings field for geo and hours.
8. Medium - Build 3-4 emirate pages (Sharjah, Abu Dhabi, Ajman) with unique content and real projects, and say which authority approvals apply.
9. Medium - Separate the Lock Shield and Lock Shield Cart entities: reciprocal links, consistent addresses/hours, fix the Cart header phone mismatch, prune or retarget off-intent Cart supplier posts. Remove /blog/test and the "-2" duplicates.
10. Low - Block or noindex the duplicate host lockshield-ten.vercel.app (200, canonical points to www, so mitigated). Collapse the http://lockshield.ae double redirect hop.

## Limitations
- Google Maps/GBP data (category, rating, review count, velocity, posts, photos) is not visible without Maps API or DataForSEO; GBP is reported as "not found via search".
- DuckDuckGo showed a bot challenge (not bypassed). Brave was rate-limited (HTTP 429) near the end, so Hidubai, Connect.ae, Dubai Chamber, and e& yellow pages checks are inconclusive.
- Competitor ranks come from Brave results, not Google's local pack. Competitor review counts come only from on-site widgets.
- DCD approved-contractor list could not be queried (portal lookup).
- WebFetch's first summary wrongly reported no JSON-LD and no Maps embed; raw HTML confirmed JSON-LD (home) and a Maps iframe (/contact). Word-count measurements were discarded as unreliable.
