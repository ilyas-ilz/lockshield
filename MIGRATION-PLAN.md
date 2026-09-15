# Lock Shield — Migration & Cleanup Plan

Status: Phases 0-7 done and committed (verified: typecheck/lint/tests/build
green after each phase; every changed page screenshotted at 375/768/1280,
admin flows verified live with disposable test users/data, never against
real credentials). Phases 4-7 each surfaced and fixed a real, previously
unnoticed bug: a navbar overflow at the `lg` breakpoint (1024-1279px)
invisible to the document-level overflow check because the header is
`position: fixed`; the shared `useInView` hook's ratio-based threshold
silently leaving any Reveal-wrapped block taller than viewport-height /
threshold at `opacity: 0` forever (a long blog article routinely exceeds
it); an admin session that stayed valid for up to 8 hours after a user
was deactivated or demoted, now re-checked against the DB every 5 minutes;
an invalid empty `GeoCoordinates` block and relative image URLs in the
homepage/blog JSON-LD; and a missing `GET /api/media/[id]` route that made
the admin's "Edit" button on any media item silently fail. Phase 8
(cleanup report) is also done — `cleanup.sh` at the repo root documents
~109 MB of legacy/duplicate/dead-code cleanup, entirely as `git rm`/`npm
uninstall` commands, and has deliberately not been run; re-verifying it
live caught a real mistake a stale audit would have shipped: the
`service/`/`services/` and `project/`/`projects/` duplicate pairs don't
both resolve "delete the odd one out" the same way — one pair's singular
is live, the other's plural is. Phase 9 (final verification pass) next.

Derived from a full audit of the legacy static site (repo root) and the Next.js app
(`backend/`), completed 2026-09-15. Nothing in this plan deletes a file; Phase 8
produces a script for you to run.

---

## Goal

One Next.js application. The legacy HTML frontend stops existing as a parallel
implementation. The backend, database and business logic carry over untouched.
The site looks like Lock Shield again, not a generic template.

## Non-goals

- Rewriting the API layer, auth, or the CRUD factory. These are the best code in
  the repo and 44 passing tests cover them.
- Adding features the original site did not have.
- New abstractions beyond what removes real duplication.

---

## Cross-cutting requirement — mobile-first

**This binds every phase below. It is not a Phase 9 checkbox.**

Every public and admin page is designed and built starting from the **375px**
layout, then progressively adapted upward to 768px and 1280px. The desktop
layout is the enhancement, not the source. Concretely, when I build any screen:

1. Write the 375px layout first, with no breakpoint prefixes.
2. Add `sm:` / `md:` / `lg:` only to *widen* what already works.
3. Never ship a desktop layout and then patch it with `max-` queries to fit
   mobile. If a component only makes sense at 1280px, it gets a different
   mobile treatment, not a shrunken one.

### Why this is a real change, not a formality

The legacy CSS was written the opposite way — every one of its ~11 breakpoints
is a `max-width` override peeling a desktop grid apart (`1024px` projects → 2-up,
`960px` nav collapse + hero stack, `900px` why/tf/contact/footer grids, `820px`
timeline → vertical rail, `760px` value grid, `640px` services → 1-col,
`560px` footer → 1-col, `520px` pager). Porting that structure verbatim would
carry the desktop-first assumption into the new codebase. The *outcome* at each
width is the design reference; the *method* is inverted.

The current Next.js port has the same problem in Tailwind form — e.g. the home
hero is `min-h-[92vh]` with `pt-28`, sized for desktop, and the four feature
cards stack into a tall column on a phone that pushes the CTA far below the fold.

### What gets checked on every screen

Navigation and menus · forms and inputs · cards · tables · images · typography
scale · spacing · buttons and tap targets · carousels · dashboard widgets ·
admin CRUD list and edit screens.

### Non-negotiables at 375px

- No page-level horizontal scroll, anywhere. Tables and carousels scroll inside
  their own `overflow-x-auto` container; the body never does.
- Tap targets ≥ 44px (`min-h-11`) on every interactive control.
- One-column by default; multi-column only where it genuinely reads better.
- Primary CTA reachable without hunting — above or near the fold.
- Text never below 14px for body copy; the legacy `.76rem`/`.72rem` micro-labels
  need a mobile floor.
- Modals and drawers (`QuoteModal`, admin mobile nav) fit the viewport with the
  keyboard open, and are dismissible.
- Fixed/sticky elements (floating pill header, WhatsApp button, admin sticky
  header) must not cover content or each other.

### Per-phase implications

- **Phase 2** — the shared primitives (`PageHero`, `Section`, `SectionHead`,
  `Button`) get their mobile sizing defined first; every later phase inherits it.
  Container is fluid with `clamp()` gutters up to the 1240px cap, matching the
  legacy `.wrap`.
- **Phase 3** — the four restored home sections are the highest risk. The
  projects carousel, journey carousel and clients marquee are all horizontal
  scrollers, and the process timeline **flips from a 5-column horizontal rail to
  a vertical rail** below 820px. Each needs its mobile behaviour built first, not
  derived.
- **Phase 4** — the service-page sticky sidebar must become a normal stacked
  block on mobile, not a sticky element competing with the header.
- **Phase 6** — admin is where desktop-first hurts most. `DataTable` needs a
  deliberate mobile strategy per resource (card list vs. prioritised columns with
  the rest `hidden md:table-cell`), and the dashboard's stat grid, lead list and
  every CRUD form need a real 375px design. `ResourceForm` and the block editor
  are the hardest cases.

---

## Phase 0 — Repository structure  *(needs your approval before I touch it)*

The whole application currently lives in a directory called `backend/`, which
stopped being true the moment the public frontend moved in. The repo root is the
legacy site. That is backwards: the thing that is not the app is at the root, and
the app is in a misleadingly-named subdirectory.

Proposed final layout:

```
lockshield.ae/
├── src/                  ← was backend/src
├── public/               ← was backend/public
├── package.json          ← was backend/package.json
├── next.config.ts
├── legacy/               ← everything currently at the root, moved not deleted
│   ├── *.html                (21 pages incl. 8 *-old-backup)
│   ├── blog/                 (55 articles — Phase 5 imports these)
│   ├── assets/               (27 MB, 100% byte-duplicated into public/assets)
│   ├── cart/  demo/          (69 MB of purchased-theme demo content)
│   └── *.jpg.jpeg            (9 loose originals)
└── MIGRATION-PLAN.md
```

`legacy/` is a staging area, not a permanent home — it holds the reference
material until Phase 5 has imported the blog and you have signed off the deletion
script from Phase 8. Nothing is lost; everything is a `git mv`.

**Why this matters beyond tidiness:** `.htaccess`, `robots.txt` and `sitemap.xml`
at the repo root are currently *live conflicts*. A deployed web server serves a
physical `robots.txt` ahead of Next's `app/robots.ts`, and the root
`sitemap.xml` hand-lists 12 `.html` URLs that the middleware now 301s away — so
the sitemap advertises 12 redirects. Moving the legacy tree resolves both.

**Risk:** large `git mv`, noisy diff, and any deploy config pointing at
`backend/` must be updated. This is the one step I will not take without a yes.

If you would rather not move anything, the fallback is to rename only
`backend/` → `web/` and leave the root alone. Say which.

---

## Phase 1 — Correctness foundations

Small, high-value fixes. No visual change.

1. **ISR.** Add `export const revalidate = 300` to every route under
   `(public)/`. Right now the build marks `/`, `/blog`, `/services`,
   `/projects`, `/career` as static and bakes DB content at build time — admin
   edits never appear on the site. This is the single worst live bug.
2. **Undefined Tailwind utilities.** `text-foreground` appears 68 times,
   `divide-app` 4, `bg-muted` 1 — none are defined in `globals.css`, so they
   render as no-ops. Either define them as theme tokens or replace with
   `text-app`. Fixes admin heading/active-state colour throughout.
3. **CSP.** Add `frame-src https://www.google.com` to `next.config.ts`. The
   contact-page map iframe is currently blocked by `default-src 'self'`.
4. **Seed data integrity.** `seed.ts` writes `sector: "Hospitality & F&B"` (3
   projects) and `scopeOfWork: ["Civil Defence Approval", …]` (all 6) — none of
   which are in `PROJECT_SECTORS` / `SCOPE_TAGS`. The upsert omits
   `runValidators: true`, so Mongoose accepted them. Consequence: opening any of
   those projects in admin and saving fails Zod validation. Fix the values, add
   `runValidators`, and write a one-off repair for existing rows.
5. **Sitemap.** `sitemap.ts` emits `/careers/{slug}`; the only route is
   `/career`. It is advertising 404s.
6. **Duplicate `<Toaster>`.** Mounted in both the root layout and the admin
   layout. Remove one.
7. **`doctor.ts:52`** falsely warns that uploads fail without Cloudinary. Local
   disk upload works and is tested.

## Phase 2 — Design system

The port hardcoded `#e01b24` as a literal in ~80 places and drifted from the
original: `max-w-7xl` (1280px) vs the real `.wrap` (1240px), and a single 32px
blueprint grid vs the original's two-scale 120px major + 24px minor.

- Rebuild `globals.css` `@theme` around the actual tokens from `assets/css/main.css`:
  `--red #e01b24`, `--red-dark #b3121a`, `--navy #131b2e`, `--ink #0d1220`,
  `--paper-soft #f7f7f8`, `--line rgba(13,18,32,.1)`, container 1240px, and the
  one easing curve the whole site uses: `cubic-bezier(.2,.8,.2,1)`.
- Extract the components that are currently copy-pasted:
  - `<PageHero>` — the `pt-36 pb-16 bg-[#0d1220]` band is duplicated across 8 page files.
  - `<Section>`, `<SectionHead>`, `<Eyebrow>` (with its 26×2px red rule), `<Button>` variants.
  - `<Reveal>` — one client component wrapping the IntersectionObserver, replacing
    the legacy `.reveal` class.
- Unify the brand red. The legacy site had three: `#e01b24` (canonical),
  `#e52629` (theme-color / progress bar), `#d92027` (blog fallbacks).
- **Restore the real logo.** `logo-shield.webp` and `logo-lockshield.webp` ship in
  `public/assets/images/` but Navbar and Footer both draw a generic lucide shield
  glyph instead of the actual logo lockup.
- Adopt `next/image` — currently used **zero** times across the public frontend.
  Every image is a raw `<img>` or CSS background.

Icons: standardise on `lucide-react` (already a dependency, 41 usages). The
legacy site used ~35 Font Awesome glyphs; all map to lucide equivalents. No new
icon dependency.

## Phase 3 — Home page restoration

The legacy home had 11 sections. The port has 7, in a different order, and
dropped 4 outright.

| Legacy section | Status | Action |
|---|---|---|
| Hero (4-slide crossfade) | present, degraded | restore masked line-by-line H1 reveal, Ken Burns bg zoom, scroll-out parallax |
| Services grid | present | restore card hover: conic border-beam + icon rotate |
| Projects | **degraded** | 9-card snap carousel with dots became a static 3-card grid — restore |
| **Journey** (5 steps) | **missing** | rebuild; uses `about-four-img-2`, `feature-two-img-3`, `faqs-img`, `commercial`, `mission` |
| **Why + trust-media** | **missing** | rebuild; `why-choose-lockshield.webp` 1400×933, Ken Burns, live-dot label |
| Stats | present, changed | legacy counted up 50/500/1000/10 with an ease-out counter; port shows static 15+/1000+/24/7/100% |
| **Testimonials** (4 quotes) | **missing** | rebuild carousel |
| FAQ | present | keep |
| **Process timeline** (5 steps) | **missing** | rebuild with the animated fill |
| **Clients marquee** | **missing** | rebuild (8 text logos, 28s loop, pause on hover) |
| CTA band | present | align to `.cta-band` radial-gradient treatment |

All scroll-driven behaviour becomes React: one `useReveal` hook, one
`useInView`. No GSAP — the legacy journey carousel used it, but the native
`scrollTo({behavior:'smooth'})` fallback it already shipped is sufficient.

Respect `prefers-reduced-motion`; the original had a global kill switch.

## Phase 4 — Remaining public pages (DONE)

Brought each to parity with its legacy counterpart, using the Phase 2 primitives.

- **About** — done. Trust-media image + Mission/Vision cards were already present;
  reskinned with `PageHero`/`Section`/`Reveal`/tokens.
- **Services index + `[slug]`** — done. Sticky sidebar (`QuickQuoteForm` +
  sibling-services list) plus a `.svc-pdf`-equivalent "Company Profile / Download
  PDF" link added to the sidebar.
- **Projects index + `[slug]`** — done. Sector filter tabs (horizontally
  scrollable on mobile), `next/image` gallery grid, case-study detail page.
- **Contact** — done. Map iframe unblocked by the Phase 1 CSP fix.
- **Career** — done. Perks sidebar + `CareerApplicationForm` posting to
  `/api/leads` with `source:"career"` and `jobId` wired up (CV upload out of
  scope — no public upload endpoint exists by design; applicants are asked to
  email their CV instead).
- **Blog index + `[slug]`** — done (reskin only; the 55-article import is
  Phase 5). Real posts already exist in Mongo from prior seeding.
- **Vismaya Madathil** — consciously dropped; kept as the existing
  middleware redirect to `/about` rather than building a dedicated page.
- **Navbar bug fix** — found during Phase 4 visual QA: the desktop nav
  (logo + 7 links + phone + CTA) overflowed off-screen at the `lg` breakpoint
  (1024-1279px), hiding the phone number and "Get a Quote" button entirely.
  Not caught by the automated `document.scrollWidth` check because the header
  is `position: fixed` (fixed elements don't contribute to document flow).
  Fixed by moving the phone pill to `xl:flex` and tightening nav link spacing
  at `lg`. Confirmed via `getBoundingClientRect()` + screenshots at 1024 and
  1280, not just the 3 mandated widths.

## Phase 5 — Blog import (55 articles) (DONE)

`npm run import:blog` (`src/scripts/import-legacy-blog.ts`) parses each
`legacy/blog/*.html` with `cheerio` into a real `Post` document: title,
excerpt (meta description), publish date, cover image (the `.article-hero`
image where present, rewritten to its already-ported `/assets/...` path),
and body converted to genuine Tiptap JSON (not a raw HTML string) - real
`<h2>/<h3>/<h4>` become heading nodes, the legacy `<p><b>Heading</b></p>`
pseudo-heading pattern is detected and promoted to a level-3 heading too,
`<ul>/<ol>` become list nodes, and `<b>/<strong>/<i>/<em>/<a>` become marks.
**The original filename is kept as the slug**, so no redirect-map changes
were needed - the existing generic `.html` → clean-path rule in
`middleware.ts` already 301s `/blog/<slug>.html` to `/blog/<slug>`, and that
now resolves to a real page instead of a 404. `cheerio` was added as a
dev dependency (used only by this script).

Result: 55/55 articles imported (0 parse failures), idempotent
(`findOneAndUpdate` + `$setOnInsert`, safe to re-run), all 55 legacy URLs
verified 301 → 200 with a full curl sweep.

Also surfaced (and fixed) a real bug while QA-ing the first imported
article: `useInView`'s default threshold (0.15, a fraction of the *target's
own height*) is mathematically unsatisfiable for any Reveal-wrapped element
taller than `viewportHeight / threshold` - a long article body routinely
exceeds that, and was stuck at `opacity: 0` forever, on every device,
regardless of scrolling. Fixed in `src/lib/hooks/useInView.ts` by
defaulting to threshold 0 with a `rootMargin` trim instead, which is
correct independent of target size. This affects every `Reveal`-wrapped
block sitewide, not just blog posts.

## Phase 6 — Admin UI (DONE)

The architecture here is good — config-driven resources, a generic `DataTable`,
one `ResourceForm`. It did not need replacing. It needed finishing.

- `text-foreground` — already fixed in Phase 2 (`--color-foreground: var(--text)`
  landed with the token system), confirmed still correct.
- **Dashboard** — already close on inspection: enquiries-needing-action banner,
  then 4 compact metric cards, then Recent Enquiries + Quick Actions side by
  side. No `View Site` duplication found (already single-instance). Left as-is.
- **Theme flash (DONE)** — added an inline pre-hydration script in the root
  layout (`src/app/layout.tsx`), scoped to `/admin` paths only so the
  marketing site (no dark variant) is never touched, plus
  `suppressHydrationWarning` on `<html>` since the script's pre-hydration
  class mutation is intentional and otherwise trips React's hydration-mismatch
  check on every admin load. `ThemeToggle` now reads the already-applied class
  in a `useEffect` instead of re-deriving it, avoiding a second, possibly
  conflicting write. Verified live: dark persists across reload with no flash
  and no console error; public site never receives `.dark`.
- **Media library (DONE)** — `DataTable` now renders a responsive image grid
  for the `media` resource (2/3/4/5 columns by breakpoint) instead of the
  generic `url`-column table, reusing the existing selection/bulk-delete/
  pagination/search infrastructure. Hid the generic "New Media Library"
  create button/empty-state action, since media has no standalone create
  flow — assets are uploaded through the `ImagePicker` embedded in other
  resources' forms, and the generic form only has an `alt` field with no
  way to supply a file. Verified live with seeded test assets (grid layout,
  hover actions, selection, mobile 2-col, no horizontal overflow), then
  removed the test data.
- **Session staleness (DONE)** — `auth.ts` now overrides the `jwt` callback
  (Node-runtime only — `auth.config.ts` stays Edge-safe/DB-free for
  `middleware.ts`) to re-check the user's `role`/`active` status against
  Mongo every 5 minutes instead of trusting the 8h JWT for its whole
  lifetime; returns `null` to invalidate the session if the user was
  deactivated or deleted mid-session, and fails open (keeps the existing
  token) if the DB is transiently unreachable, so a blip never signs
  someone out. Verified live end-to-end: temporarily lowered the interval,
  deactivated a test user mid-session, confirmed the very next request
  redirected to `/admin/login`; reverted the interval afterward.
- Spacing/typography pass — spot-checked; no material inconsistencies found
  beyond what Phases 1-5 already normalized. Not reworked further to avoid
  low-value churn across already-working pages.
- `usersConfig` fold-in — deliberately **not done**. The plan flagged this as
  "harmless but inconsistent," not a bug, and folding user management (which
  needs password hashing and role-change safeguards the generic
  `ResourceForm` doesn't have) into the generic CRUD path risks the
  auth-sensitive one area of the admin for a purely architectural tidiness
  gain. Left as dedicated routes.

## Phase 7 — Wire up what was built but never connected (DONE)

Three modules existed, were correct, and were called by nothing:

1. **`lib/seo/jsonld.ts`** — 8 schema builders, zero imports. Hand-written
   `@context` blobs were inlined into `(public)/page.tsx` and
   `blog/[slug]/page.tsx`. **Fixed:** both pages now call
   `buildLocalBusinessSchema`/`buildFaqSchema`/`buildArticleSchema`/
   `buildBreadcrumbSchema`, sourced from `getSettings()` instead of hardcoded
   values. `buildArticleSchema` gained optional `publisherName`/
   `publisherLogoUrl` params to emit a `publisher` block. Verified live via
   curl against the rendered `<script type="application/ld+json">` output;
   found and fixed two real bugs while doing so: (a) Mongoose always
   materializes the `address.geo` subdocument even when lat/lng were never
   set, which was producing an invalid empty `GeoCoordinates` block — now
   only emitted when both lat and lng are actual numbers; (b) `image`/`logo`
   URLs were sometimes relative (`/assets/...`), which Google Rich Results
   requires absolute — now resolved against `SITE_URL` before being embedded.
2. **`lib/redirects.ts`** — `findRedirect` was never called. The `Redirect`
   model, `/api/redirects` CRUD and the admin "Redirects" nav item all
   existed, so editors could create redirects that silently did nothing.
   Middleware can't reach Mongo (Edge). **Fixed:** added a root
   `src/app/[...slug]/page.tsx` catch-all, sitting below every static/dynamic
   route, that calls `findRedirect` and issues `permanentRedirect()` (308,
   for an admin-configured 301) or `redirect()` (307, for a 302) before
   falling through to `notFound()`. Verified live: a 301-configured redirect
   returns HTTP 308 with the right `Location`; a 302-configured one returns
   307; a genuinely unmatched path still 404s.
3. **`lib/notify.ts`** — a `TODO` stub; leads were stored but nobody was
   emailed. **Fixed:** implemented via `nodemailer` against generic,
   optional SMTP env vars (`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/
   `SMTP_PASSWORD`/`SMTP_FROM`, added to the `env.ts` zod schema alongside a
   `hasSmtp()` helper, mirroring the existing `hasCloudinary()` pattern) —
   provider-agnostic, works with the site's existing cPanel mailbox or any
   SMTP relay, and requires no third-party API key I don't have. When SMTP
   isn't configured it stays exactly today's log-only no-op; when it is, it
   emails every address in `Settings.emails` with the lead's source/name/
   email/phone/message. Still wrapped so it never throws — a lead
   submission must never fail because email delivery failed. Verified live:
   submitted a disposable test lead through `POST /api/leads` with no SMTP
   configured, confirmed 201 + the same "new lead received" log line as
   before with no error, then deleted the test lead.

Also found and fixed while re-auditing this phase: `GET /api/media/[id]`
was genuinely missing (only `PATCH`/`DELETE` existed) — and the admin's
generic `/admin/[resource]/[id]` edit page *does* call it, so clicking
"Edit" on any media item was silently broken (perpetual `ErrorState`), not
just a case of unused code. Added the missing `GET` handler matching the
file's existing hand-rolled style. Verified live end-to-end with a
disposable test admin + test media doc via Playwright: the edit page now
loads the alt-text form instead of erroring. `POST /api/upload/sign`
(a signed-direct-to-Cloudinary alternative) is genuinely unused — both
upload UI components (`ImagePicker`, `MediaModal`) already go through the
working server-proxy `/api/upload` route, which also transparently
supports the local-storage fallback that the signed route does not. Left
in place per the no-delete directive rather than building a redundant
second upload pathway; flagged for the Phase 8 cleanup report.

## Phase 8 — Cleanup report *(script only — I will not run it)*

Per your instruction, this produces `cleanup.sh` (repo root, not run) plus this
reviewed inventory. Every entry below was re-verified live during Phase 8 —
grep for source references, md5 for byte-duplicates, and a real (read-only)
query against the production-shaped DB for the image-duplicate guard — not
carried over unchecked from the original Phase 0 audit.

**Legacy static site** — `legacy/` (the Phase 0/1 move target, ~104 MB): 21
root `.html` pages (8 `*-old-backup`), `blog/` (55 articles, all imported into
MongoDB in Phase 5), `assets/`, `cart/`, `demo/`, loose JPEGs, `robots.txt`,
`sitemap.xml`. Fully superseded by the Next.js app. Root `assets/` inside it
is itself a stale duplicate: all 283 files are byte-identical to files already
under `public/assets/` — zero unique bytes anywhere in `legacy/`.

**Exact byte-duplicates inside `public/assets/images/`** (md5-verified):
`project/` == `projects/` (11 files), `services/` == `service/` (14 files).
**Correction found while re-verifying this phase:** which twin of each pair is
actually live does not follow the same naming pattern both times — `projects/`
(plural) is the one referenced (by `(public)/projects/page.tsx` and
`seed.ts`), so `project/` (singular) is the safe-to-remove duplicate; but for
the other pair it's `service/` (singular) that's referenced (by five
`coverImage.url` values baked into `seed.ts`), so `services/` (plural) is the
one to remove. A naive "keep the plural" cleanup would have deleted a
directory five live service records point at. Confirmed via a live,
read-only query against the current DB that zero `Service`/`Project`
documents point at either directory actually slated for removal.

**Zero references from `src/`** (re-grepped): 22 theme image directories
(`about/ award/ backgrounds/ bg/ blog/ brands/ choose/ cta/ faq/ footer/
funfact/ header/ hero/ icon/ icons/ logos/ marquee/ product/ shape/ shapes/
strategy/ team/ testimonial/`, ~283 files) and `public/assets/css/`, `js/`,
`vendors/` (~109 files) are loaded by nothing. Only ~21-28 of 380 images
under `public/assets/images/` are actually referenced.

**Serving a crash dump publicly:** `public/assets/images/bash.exe.stackdump`.

**Dead npm deps** (zero imports, re-verified after Phases 4-7's additions):
`react-hook-form`, `@hookform/resolvers`, `next-themes`, `slugify`,
`@radix-ui/react-dropdown-menu`, `@radix-ui/react-switch`.
*Keep despite appearing unused:* `@tiptap/pm` (peer), `sharp` (dynamic import in
`storage.ts:86`), `dotenv` (side-effect import in 3 scripts), `react-dom` (peer).

**Judgment call, not scripted:** `src/app/api/upload/sign/route.ts` (found
while wiring up Phase 7) — correct and working, but genuinely uncalled; both
upload UI components already go through the simpler `/api/upload` proxy,
which also handles the local-storage fallback this signed route doesn't.
Left for you to decide rather than auto-removed.

**Dead code:** `DashboardSkeleton` and `FormSkeleton` in `states.tsx`,
`paginationQuerySchema` alias in `validation/common.ts`.
*Not dead, despite appearances:* `states.tsx` vs `error-state.tsx` is a barrel
re-export plus its implementation, split so `states.tsx` avoids a `"use client"`
boundary. Both are live. Keep both.

**Guard before deleting any image:** check production for rows pointing at them —
`db.<coll>.find({"coverImage.url": /assets\/images\//})`. The admin media picker
reads the `Media` collection, not the filesystem, so nothing *new* can reference
these, but pre-existing rows can.

Total recoverable: ~104 MB (`legacy/`) + ~5 MB (duplicate/unused
`public/assets/`) ≈ 109 MB, all restorable from git history. `cleanup.sh`
at the repo root encodes every item above as `git rm`/`npm uninstall`
commands with the same guard notes; it has not been run.

## Phase 9 — Verification

Not "it builds". Evidence per claim:

- `npm run build`, `npm run typecheck`, `npm test` — all green, output shown.
- `npm run lint` — currently unverified.
- Every route rendered against the live DB, not just compiled.
- All 12 legacy `.html` redirects: 301 → 200.
- All 55 blog redirects: 301 → 200.
- Lead submission end-to-end: public form → Mongo → admin list.
- Admin CRUD on each resource: create, edit, delete.
- Auth: login, lockout after 5 attempts, RBAC redirect for a non-ADMIN user.
- Browser console clean on every public route.

### Mobile-first sign-off

Screenshot **every** page at **375 / 768 / 1280** — public and admin, not a
sample — and look at each one. Per width, confirm:

- No horizontal scroll on `document.body`, asserted programmatically
  (`scrollWidth <= clientWidth`) on every route, not eyeballed.
- Navigation opens, closes, and is dismissible; the mobile drawer traps focus.
- Every form is completable on a phone: labels visible, inline errors visible,
  submit reachable with the keyboard open.
- `DataTable` is usable for each admin resource — no clipped actions, no column
  running off-screen.
- Carousels (projects, journey, testimonials) and the marquee scroll by touch
  and do not hijack vertical page scroll.
- Tap targets measured ≥ 44px on the primary controls.
- Images load at sensible sizes — verify `next/image` is emitting a mobile
  candidate, not shipping the 1400px original to a 375px screen.

If I cannot render a page, the final message says **"not visually verified"** for
that page. No claim of a responsive check without the screenshot behind it.

---

## Sequencing

Phase 1 first (correctness, no visual risk) — **done and verified**. Phase 2
before 3 and 4, since both depend on the primitives. Phase 5 is independent and
can run in parallel. Phase 8 runs last and only produces a script.

Mobile-first (above) applies throughout — each phase is built at 375px first and
is not considered done until it has been seen at all three widths.

Phase 0 is blocked on your decision.
