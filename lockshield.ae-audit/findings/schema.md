# Structured Data (Schema.org) Audit - https://www.lockshield.ae

Audit date: 2026-10-12. Method: read-only GET of 19 live pages (throttled ~1.6 req/s), JSON-LD parsed with a JSON parser, Microdata/RDFa grep, cross-check against the repo (`src/lib/seo/jsonld.ts` and callers) and against visible page text.

**Schema score: 40 / 100**

Everything that is emitted is valid and well-formed, but coverage is thin. Only 5 of the 19 pages checked carry any JSON-LD (home plus the 4 blog posts). The 6 service pages, both project pages, About, Contact, Services, Projects, Blog index and Career have none. The one business entity is generic and missing the local-SEO fields.

## 1. Detection results (live HTML)

| Page | JSON-LD found | Valid JSON | Notes |
|---|---|---|---|
| `/` | LocalBusiness (`@id` .../#organization), FAQPage (10 Q&A) | yes | Microdata 0, RDFa 0 |
| `/about` | none | n/a | |
| `/contact` | none | n/a | NAP visible, no schema |
| `/services` | none | n/a | |
| `/services/annual-maintenance-contract` | none | n/a | |
| `/services/designing-drawing-civil-defence-approval` | none | n/a | |
| `/services/fm-200-special-systems` | none | n/a | |
| `/services/kitchen-fire-suppression-systems` | none | n/a | |
| `/services/fire-extinguisher-refilling` | none | n/a | |
| `/services/fire-system-products-supply` | none | n/a | |
| `/projects` | none | n/a | |
| `/projects/emirates-nbd` | none | n/a | |
| `/projects/the-grey-restaurant` | none | n/a | |
| `/blog` | none | n/a | |
| `/blog/protecting-data-centers-fm-200-clean-agent-suppression` | Article, BreadcrumbList | yes | has image |
| `/blog/fire-extinguisher-types` | Article, BreadcrumbList | yes | no image |
| `/blog/why-fire-pumps-fail-and-how-proper-servicing-prevents-it` | Article, BreadcrumbList | yes | has image |
| `/blog/test` (extra, in sitemap) | Article, BreadcrumbList | yes | no image; slug is `test` for a real article |
| `/career` | none | n/a | "Current Opportunities (0)", so no JobPosting is correct today |

Repo confirms this. Only two files emit JSON-LD: `src/app/(public)/page.tsx` (lines ~205-207) and `src/app/(public)/blog/[slug]/page.tsx` (lines ~97-104). `buildServiceSchema`, `buildJobPostingSchema` and `buildItemListSchema` in `src/lib/seo/jsonld.ts` are never called (dead code).

## 2. Validation results per block

| Block | Result | Detail |
|---|---|---|
| Home LocalBusiness | PASS (valid) / incomplete | `@context` https, absolute URLs, `@id`/`url` on https://www.lockshield.ae, name/address/telephone/url/image/sameAs/areaServed present. Missing geo, openingHoursSpecification, priceRange, hasMap, addressRegion, specific subtype. |
| Home FAQPage | PASS (valid) | 10 Q&A, all 10 questions are visible on the page (content parity OK). |
| Blog Article x4 | PASS (valid) / quality issues | headline, url, datePublished/dateModified (ISO 8601), author, publisher present. Issues listed in findings. |
| Blog BreadcrumbList x4 | PASS | 3 ListItems, positions 1-3, absolute `item` URLs. |

NAP vs visible page (home footer + `/contact`): PASS. Name "LOCK SHIELD Firefighting and Safety Equipment Installation LLC", telephone "+971 4 272 7333", email info@lockshield.ae, P.O. Box 47672, "Hor Al Anz, Deira, Dubai, UAE" all match the schema. Not in schema: the second visible phone +971 52 843 4801 (WhatsApp), and the "24/7 emergency hotline" claim.

Host consistency: PASS. `@id`/`url`/breadcrumb/Article URLs all use https://www.lockshield.ae. Apex and http both return 308 to https://www.lockshield.ae/. Canonicals match. robots.txt and sitemap.xml are on www. Schema images exist (logo-lockshield.png 1200x910, logo-shield.png 598x618, 200 OK).

Note: an earlier "�" seen in blog titles was a console rendering artifact. Raw bytes are valid UTF-8 em dashes, so it is not a site problem.

## 3. Findings

### HIGH

**H1. Service pages (6 of 6) have no structured data.** Evidence: no ld+json, microdata or RDFa on any `/services/<slug>`. `buildServiceSchema` exists but is never called, and it also has a defect: `provider` is a new unnamed-by-`@id` LocalBusiness, which would create a duplicate entity. Fix: emit `Service` + `BreadcrumbList` on `src/app/(public)/services/[slug]/page.tsx`, and make `provider` an `{"@id": ".../#organization"}` reference (snippets 5.3 and 5.4).

**H2. LocalBusiness entity is generic and missing the local-SEO fields.** Evidence: `@type` is plain `LocalBusiness`. The live JSON has no `geo` (the code supports it, but `Settings.address.geo` is empty in production), no `openingHoursSpecification`, `priceRange`, `hasMap`, `addressRegion` or `contactPoint`. `areaServed` is the bare string "AE". `telephone` has spaces and only the first phone is emitted. Fix: change to `["HomeAndConstructionBusiness","ProfessionalService"]`, fill Settings (geo, hours), and add the fields in snippet 5.1.

### MEDIUM

**M1. No Organization/WebSite entity, and no shared `@id` graph.** Evidence: the blog `publisher` is a separate, unlinked Organization named "Lock Shield Firefighting & Safety Equipment Installation LLC" (hardcoded in `blog/[slug]/page.tsx` line ~86) with logo `logo-shield.png`. The LocalBusiness is named "LOCK SHIELD Firefighting and Safety Equipment Installation LLC" with logo `logo-lockshield.png`. Same company, two names, two logos, no linking. No WebSite node (the site-name hint for Google). Fix: emit one site-wide `@graph` (LocalBusiness + WebSite) from `src/app/(public)/layout.tsx`, which already loads Settings, and reference it by `@id` everywhere (snippet 5.1).

**M2. BreadcrumbList only exists on blog posts.** Evidence: missing on the 6 service pages, 2 project pages, /services, /projects, /about, /contact, /career, /blog. Fix: call `buildBreadcrumbSchema` on each (snippets 5.3-5.8).

**M3. Blog posts: weak Article markup.** Evidence (live JSON):
- `@type` is `Article` for what is a blog; `BlogPosting` is more precise.
- `author` is `{"@type":"Person","name":"Lock Shield Fire Safety Engineering Desk"}`, a team label typed as a Person. Use an Organization reference or a real named Person with a `url`.
- No `mainEntityOfPage`.
- `/blog/fire-extinguisher-types` and `/blog/test` have no `image`, and there is no og:image fallback on these posts.
- `dateModified` is 2026-09-23 on every legacy post (import timestamp), e.g. the 2023 post `fire-extinguisher-types`. This overstates freshness.
- `description` is cut mid-word at ~150 chars on imported posts.
- The data-center post uses `service-1.webp` (420x450) as its image.

Fix: use `buildBlogPostingSchema` (snippet 5.9), set `mainEntityOfPage`, author as Organization, a default image fallback ≥1200px wide, and real `dateModified`. Files: `src/lib/seo/jsonld.ts`, `src/app/(public)/blog/[slug]/page.tsx` (author/publisher strings are hardcoded at lines ~85-87).

**M4. `sameAs` mixes in a different brand and contradicts its own comment.** Evidence: `sameAs` = Instagram `lockshield_cart`, LinkedIn `company/lockshield`, and `https://www.lockshieldcart.com` (a partner/store domain). The comment in `jsonld.ts` calls this a "real, crawlable backlink signal". `sameAs` asserts "this is the same entity"; it passes no link equity. None of these three URLs is rendered as a visible link on the page. No Facebook, YouTube or Google Business Profile URL. Fix: keep only profiles that are the same entity, add GBP/Maps/Facebook/YouTube if they exist, and move the partner site out of `sameAs` (confirm the relationship with the owner first). Reword the comment.

### LOW

**L1. Page-level schema missing on About, Contact, listings and project pages.** Add `AboutPage`, `ContactPage` (with `mainEntity` = LocalBusiness `@id`), `CollectionPage` + `ItemList` for /services, /projects, /blog and /career, and a `CreativeWork` case study on `/projects/<slug>` (snippets 5.5-5.8). No Google rich result exists for these; the value is entity clarity and AI/semantic parsing.

**L2. Homepage LocalBusiness is gated on DB success.** Evidence: in `page.tsx` it is built inside `try {...}` and omitted entirely on error. Fix: static fallback constants, or move to layout with fallbacks. It is also on the homepage only; the entity should be reachable from /contact too (via the layout graph).

**L3. JSON-LD serialized without `<` escaping.** Evidence: `JSON.stringify(...)` into `dangerouslySetInnerHTML` at `page.tsx` ~205/207 and `blog/[slug]/page.tsx` ~99/103. Admin-editable titles/excerpts containing `</script>` could break out of the tag. Fix: `safeJsonLd()` helper that replaces `<` with `<` (section 6).

**L4. `/blog/test` is live and in the sitemap** with Article schema for "Fire Alarm Companies in Dubai", plus numbered near-duplicates (`...-2`). Give it a real slug and redirect, or unpublish. (SEO-adjacent, noted here because it emits schema.)

**L5. Telephone format.** Prefer E.164 (`+97142727333`, matching the `tel:` href) over `+971 4 272 7333`. Valid either way.

### INFO

**I1. FAQPage on home is valid and the content is visible.** Google restricted FAQ rich results to government and health sites in August 2023, so no FAQ rich result is expected for this commercial site. Keep it: it still helps AI/LLM citation and semantic understanding. Do not add FAQPage to other pages for Google benefit. If you do want it for GEO, add only where the Q&A is visible on the page.

**I2. JobPosting correctly absent.** `/career` shows 0 openings and there is no `/career/[slug]` route. Google needs JobPosting on a job-detail page, so build the route first. The existing `buildJobPostingSchema` needs the extra properties in snippet 5.10 (`identifier`, `directApply`, org logo, `jobLocation` street/region, `baseSalary` if known, an HTML `description` converted from the Tiptap JSON). Not Google-eligible until then.

**I3. Home LocalBusiness `logo` and `image` are the same logo file.** Google prefers real photos in `image` (storefront or team, 1:1, 4:3, 16:9). Add 1-3 photos.

**I4. Deprecated types.** None used (no HowTo, SpecialAnnouncement, etc.). The sitelinks search box is no longer shown by Google, so no `SearchAction` is recommended on WebSite.

## 4. Repo pointers

| Change | File |
|---|---|
| New/updated builders (`buildSiteGraph`, `buildBlogPostingSchema`, fixed `buildServiceSchema`, `safeJsonLd`) | `src/lib/seo/jsonld.ts` (+ update `src/lib/seo/__tests__/jsonld.test.ts`) |
| Site-wide LocalBusiness + WebSite graph (remove the duplicate from the home page) | `src/app/(public)/layout.tsx` (already calls `getSettings()`); remove `jsonLdLocalBusiness` at `src/app/(public)/page.tsx` ~126-205 |
| Settings fields for hours, priceRange, geo, short description | `src/models/Settings.ts` + admin settings form; geo is `address.geo.{lat,lng}` and already wired |
| Service pages | `src/app/(public)/services/[slug]/page.tsx` (has no JSON-LD today) |
| Project pages | `src/app/(public)/projects/[slug]/page.tsx` |
| About / Contact / Services / Projects / Blog index / Career | `src/app/(public)/{about,contact,services,projects,blog,career}/page.tsx` |
| Blog posts | `src/app/(public)/blog/[slug]/page.tsx` |

## 5. Ready-to-use JSON-LD

`SITE` = https://www.lockshield.ae. All URLs absolute, https, www, no trailing slash (matches canonicals).

### 5.1 Site-wide graph (put in layout; emit on every page)

Items to confirm before shipping:
- `geo` is an approximate Hor Al Anz, Deira centroid, NOT surveyed. Copy the exact lat/lng from the Google Business Profile pin into Settings.
- `openingHoursSpecification` office hours are an assumption (Mon-Sat 08:00-18:00). Confirm and make them match the Google Business Profile exactly. The 24/7 emergency line is supported by visible text on /contact and the FAQ.
- `priceRange` "$$" is a judgement for a quote-based B2B firm; confirm or drop it.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["HomeAndConstructionBusiness", "ProfessionalService"],
      "@id": "https://www.lockshield.ae/#organization",
      "name": "LOCK SHIELD Firefighting and Safety Equipment Installation LLC",
      "alternateName": ["Lock Shield", "Lockshield", "Lock Shield Fire Safety"],
      "description": "Dubai Civil Defence approved fire protection contractor: fire alarm, sprinkler, FM-200 and kitchen suppression systems, annual maintenance contracts, DCD drawings and approvals, and certified firefighting equipment supply across the UAE.",
      "url": "https://www.lockshield.ae",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.lockshield.ae/#logo",
        "url": "https://www.lockshield.ae/assets/images/logo-lockshield.png",
        "width": 1200,
        "height": 910
      },
      "image": ["https://www.lockshield.ae/assets/images/logo-lockshield.png"],
      "telephone": "+97142727333",
      "email": "info@lockshield.ae",
      "address": {
        "@type": "PostalAddress",
        "postOfficeBoxNumber": "47672",
        "streetAddress": "Hor Al Anz, Deira",
        "addressLocality": "Dubai",
        "addressRegion": "Dubai",
        "addressCountry": "AE"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 25.2855, "longitude": 55.3335 },
      "hasMap": "https://www.google.com/maps/search/?api=1&query=Hor%20Al%20Anz%2C%20Deira%2C%20Dubai%2C%20UAE",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "18:00"
        }
      ],
      "priceRange": "$$",
      "areaServed": [
        { "@type": "AdministrativeArea", "name": "Dubai" },
        { "@type": "AdministrativeArea", "name": "Abu Dhabi" },
        { "@type": "AdministrativeArea", "name": "Sharjah" },
        { "@type": "AdministrativeArea", "name": "Ajman" },
        { "@type": "AdministrativeArea", "name": "Umm Al Quwain" },
        { "@type": "AdministrativeArea", "name": "Ras Al Khaimah" },
        { "@type": "AdministrativeArea", "name": "Fujairah" }
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "emergency",
          "telephone": "+97142727333",
          "email": "info@lockshield.ae",
          "areaServed": "AE",
          "availableLanguage": ["English", "Arabic"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "00:00",
            "closes": "23:59"
          }
        },
        {
          "@type": "ContactPoint",
          "contactType": "sales",
          "telephone": "+971528434801",
          "areaServed": "AE",
          "availableLanguage": ["English", "Arabic"]
        }
      ],
      "sameAs": [
        "https://www.linkedin.com/company/lockshield"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.lockshield.ae/#website",
      "url": "https://www.lockshield.ae",
      "name": "Lock Shield",
      "alternateName": ["Lockshield", "Lock Shield UAE"],
      "inLanguage": "en",
      "publisher": { "@id": "https://www.lockshield.ae/#organization" }
    }
  ]
}
```

`sameAs` above keeps only the LinkedIn page; add the Instagram, Facebook, YouTube and Google Business Profile URLs only after confirming they are Lock Shield's own profiles (see M4).

### 5.2 Home page

Keep the existing FAQPage block unchanged (valid; see I1). Remove the duplicate LocalBusiness from the page once 5.1 is in the layout.

### 5.3 Service page (template: Kitchen Fire Suppression Systems)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://www.lockshield.ae/services/kitchen-fire-suppression-systems#service",
      "name": "Kitchen Fire Suppression Systems",
      "serviceType": "Commercial kitchen fire suppression system installation and maintenance",
      "description": "UL-300 certified wet chemical fire suppression safeguarding commercial kitchen hoods, ducts, and cooking appliances.",
      "url": "https://www.lockshield.ae/services/kitchen-fire-suppression-systems",
      "provider": { "@id": "https://www.lockshield.ae/#organization" },
      "areaServed": { "@type": "Country", "name": "United Arab Emirates" },
      "mainEntityOfPage": { "@id": "https://www.lockshield.ae/services/kitchen-fire-suppression-systems" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.lockshield.ae" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.lockshield.ae/services" },
        { "@type": "ListItem", "position": 3, "name": "Kitchen Fire Suppression Systems", "item": "https://www.lockshield.ae/services/kitchen-fire-suppression-systems" }
      ]
    }
  ]
}
```

Values for the other five services (same template; `name`/`description` are the live titles/meta descriptions, `serviceType` is a suggested label). Add `image` from `coverImage` when one is set:

| slug | name | serviceType | description |
|---|---|---|---|
| annual-maintenance-contract | Annual Maintenance Contract (AMC) | Fire protection annual maintenance contract | Comprehensive preventative maintenance, quarterly inspections, and 24/7 emergency response for all fire protection assets. |
| designing-drawing-civil-defence-approval | Designing, Drawing & Civil Defence Approval | Fire protection design and Civil Defence approval | Full engineering design, AutoCAD shop drawings, and hassle-free approvals from Dubai Civil Defence (DCD). |
| fm-200-special-systems | FM-200 Special Fire Suppression Systems | Clean agent fire suppression system installation | Waterless clean agent fire extinguishing solutions protecting sensitive server rooms, data centers, and critical facilities. |
| fire-extinguisher-refilling | Fire Extinguisher Refilling & Testing | Fire extinguisher refilling and hydrostatic testing | Authorized hydrostatic testing, refilling, and certification for CO2, DCP, foam, and water extinguishers. |
| fire-system-products-supply | Fire System Products Supply & Trading | Fire protection equipment supply | Genuine certified firefighting equipment, alarm panels, smoke detectors, landing valves, and fire hoses. |

### 5.4 Fixed `buildServiceSchema` (src/lib/seo/jsonld.ts)

```ts
export function buildServiceSchema(svc: {
  name: string; description: string; url: string; serviceType?: string; imageUrl?: string; siteUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${svc.url}#service`,
    name: svc.name,
    ...(svc.serviceType ? { serviceType: svc.serviceType } : {}),
    description: svc.description,
    url: svc.url,
    ...(svc.imageUrl ? { image: svc.imageUrl } : {}),
    provider: { "@id": `${svc.siteUrl}/#organization` },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
    mainEntityOfPage: { "@id": svc.url },
  };
}
```

### 5.5 About page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://www.lockshield.ae/about#webpage",
      "url": "https://www.lockshield.ae/about",
      "name": "About Us | Civil Defence Approved Fire Protection | Lock Shield UAE",
      "isPartOf": { "@id": "https://www.lockshield.ae/#website" },
      "about": { "@id": "https://www.lockshield.ae/#organization" },
      "inLanguage": "en"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.lockshield.ae" },
        { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://www.lockshield.ae/about" }
      ]
    }
  ]
}
```

Optional trust signal: the About page shows "Dubai Civil Defence Approved, License No: 65123". If that is accurate and public, add `"identifier": {"@type":"PropertyValue","name":"Dubai Civil Defence licence number","value":"65123"}` to the LocalBusiness node.

### 5.6 Contact page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://www.lockshield.ae/contact#webpage",
      "url": "https://www.lockshield.ae/contact",
      "name": "Contact Us | Dubai Fire Protection Specialists | Lock Shield UAE",
      "isPartOf": { "@id": "https://www.lockshield.ae/#website" },
      "about": { "@id": "https://www.lockshield.ae/#organization" },
      "mainEntity": { "@id": "https://www.lockshield.ae/#organization" },
      "inLanguage": "en"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.lockshield.ae" },
        { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://www.lockshield.ae/contact" }
      ]
    }
  ]
}
```

### 5.7 /services and /projects listings

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.lockshield.ae/services#webpage",
      "url": "https://www.lockshield.ae/services",
      "name": "Fire Protection Services in Dubai | Lock Shield UAE",
      "isPartOf": { "@id": "https://www.lockshield.ae/#website" },
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Annual Maintenance Contract (AMC)", "url": "https://www.lockshield.ae/services/annual-maintenance-contract" },
          { "@type": "ListItem", "position": 2, "name": "Designing, Drawing & Civil Defence Approval", "url": "https://www.lockshield.ae/services/designing-drawing-civil-defence-approval" },
          { "@type": "ListItem", "position": 3, "name": "FM-200 Special Fire Suppression Systems", "url": "https://www.lockshield.ae/services/fm-200-special-systems" },
          { "@type": "ListItem", "position": 4, "name": "Kitchen Fire Suppression Systems", "url": "https://www.lockshield.ae/services/kitchen-fire-suppression-systems" },
          { "@type": "ListItem", "position": 5, "name": "Fire Extinguisher Refilling & Testing", "url": "https://www.lockshield.ae/services/fire-extinguisher-refilling" },
          { "@type": "ListItem", "position": 6, "name": "Fire System Products Supply & Trading", "url": "https://www.lockshield.ae/services/fire-system-products-supply" }
        ]
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.lockshield.ae" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.lockshield.ae/services" }
      ]
    }
  ]
}
```

Use the same shape for `/projects` (CollectionPage + ItemList of `/projects/<slug>`, name "Completed Projects & Fit-Outs | Lock Shield UAE") and `/blog` (type `Blog`, with `blogPost` items; name "Fire Safety Blog & Knowledge Center | Lock Shield UAE"). The existing `buildItemListSchema` can generate the list. Build the ItemList from the DB query already run by each page.

### 5.8 Project case study (template: Emirates NBD) and /career

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CreativeWork",
      "@id": "https://www.lockshield.ae/projects/emirates-nbd#project",
      "name": "Emirates NBD Corporate Facility",
      "description": "Clean agent FM-200 gas suppression for main server rooms and early-warning aspiration detection.",
      "url": "https://www.lockshield.ae/projects/emirates-nbd",
      "image": "https://www.lockshield.ae/assets/images/projects/emirates-nbd.webp",
      "dateCreated": "2023",
      "locationCreated": { "@type": "Place", "name": "Dubai, UAE" },
      "creator": { "@id": "https://www.lockshield.ae/#organization" },
      "about": { "@type": "Organization", "name": "Emirates NBD" },
      "isPartOf": { "@id": "https://www.lockshield.ae/#website" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.lockshield.ae" },
        { "@type": "ListItem", "position": 2, "name": "Projects", "item": "https://www.lockshield.ae/projects" },
        { "@type": "ListItem", "position": 3, "name": "Emirates NBD Corporate Facility", "item": "https://www.lockshield.ae/projects/emirates-nbd" }
      ]
    }
  ]
}
```

Map from the Project model: `title`, `summary`, `coverImage.url` (made absolute), `year`, `emirate`/`area`, `client`. There is no Google rich result for project pages; the value is entity and breadcrumb clarity.

`/career` today: `CollectionPage` + `BreadcrumbList` only (Home > Careers). No JobPosting while there are 0 openings.

### 5.9 Corrected blog post markup (example: fire-extinguisher-types)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://www.lockshield.ae/blog/fire-extinguisher-types#article",
      "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.lockshield.ae/blog/fire-extinguisher-types" },
      "headline": "Fire Extinguisher Types",
      "description": "Fire extinguishers are classified by the types of fire they can combat. This guide explains the classes and which to use.",
      "url": "https://www.lockshield.ae/blog/fire-extinguisher-types",
      "image": ["https://www.lockshield.ae/assets/images/banner-1.png"],
      "datePublished": "2023-12-17T18:30:00.000Z",
      "dateModified": "2023-12-17T18:30:00.000Z",
      "inLanguage": "en",
      "author": { "@id": "https://www.lockshield.ae/#organization" },
      "publisher": { "@id": "https://www.lockshield.ae/#organization" },
      "isPartOf": { "@id": "https://www.lockshield.ae/#website" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.lockshield.ae" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.lockshield.ae/blog" },
        { "@type": "ListItem", "position": 3, "name": "Fire Extinguisher Types", "item": "https://www.lockshield.ae/blog/fire-extinguisher-types" }
      ]
    }
  ]
}
```

Notes: `dateModified` here is set equal to `datePublished` because the live value (2026-09-23) is the import timestamp. Use a real edit date once you have one. `description` is a rewritten example; in code use the full excerpt, not a 150-char cut. `image` falls back to a default ≥1200px-wide image when the post has no cover (the `banner-1.png` URL is what the site already uses for og:image elsewhere; replace it with a proper default post image). If a real named author exists, use `{"@type":"Person","name":"...","url":"..."}` instead of the Organization reference.

### 5.10 JobPosting (only once a `/career/[slug]` detail route exists and a role is open)

Illustrative example only. No roles are open today; do not publish this as-is.

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Fire Protection Engineer",
  "description": "<p>Design and supervise fire alarm and suppression installations in line with Dubai Civil Defence requirements.</p>",
  "datePosted": "2026-10-12T09:00:00+04:00",
  "validThrough": "2026-11-30T23:59:00+04:00",
  "employmentType": "FULL_TIME",
  "directApply": false,
  "identifier": { "@type": "PropertyValue", "name": "LOCK SHIELD Firefighting and Safety Equipment Installation LLC", "value": "fire-protection-engineer" },
  "hiringOrganization": {
    "@type": "Organization",
    "name": "LOCK SHIELD Firefighting and Safety Equipment Installation LLC",
    "sameAs": "https://www.lockshield.ae",
    "logo": "https://www.lockshield.ae/assets/images/logo-lockshield.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hor Al Anz, Deira",
      "addressLocality": "Dubai",
      "addressRegion": "Dubai",
      "addressCountry": "AE"
    }
  }
}
```

Google-eligible requirements: JobPosting on the job's own detail page; `title`, `description` (HTML), `datePosted`, `hiringOrganization.name`, `jobLocation.address` with `addressCountry`. Recommended: `validThrough`, `employmentType`, `identifier`, `directApply`, `baseSalary` (add if a range is published), `hiringOrganization.logo`. Remove or update the posting when filled. Gaps in the existing `buildJobPostingSchema`: no `identifier`, `directApply`, org logo, `streetAddress`/`addressRegion`; `description` is Tiptap JSON in `Job` and must be rendered to HTML first; the `Job` model has no salary field.

## 6. Hardening helper (src/lib/seo/jsonld.ts) and shared component

```ts
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

```tsx
// src/components/seo/JsonLd.tsx
import { safeJsonLd } from "@/lib/seo/jsonld";
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
```

Use `<JsonLd data={...} />` in the layout, home, service, project, blog and listing pages instead of the hand-written `<script>` tags.

## 7. Coverage notes and limits

- Fetched and parsed: every page in the assignment (19 pages, including `/blog/test` as an extra). All 6 service pages were checked, as the brief required.
- Not checked: the other ~56 blog posts (assumed to use the same `blog/[slug]` template, so the same Article/BreadcrumbList output), the 4 other project pages (`feetlab`, `al-manara-pharmacy`, `farsi-restaurant`, `pizza-hut`; same template, no JSON-LD in code), and the Mongo-backed content fields (cover images, per-post authors) beyond what the rendered HTML shows.
- Not run: Google Rich Results Test and the Schema.org validator (no external validator calls were made; validation here was JSON parsing plus a manual check against Google's documented required/recommended properties). The `sameAs` target URLs were not fetched.
- The current production Settings values (geo, hours, social URLs) were inferred from the rendered output, not read from the database.
- The geo, office-hours and priceRange values in snippet 5.1 are assumptions or approximations and must be confirmed with the business before shipping.
