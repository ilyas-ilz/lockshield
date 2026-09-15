# Lock Shield — Migration & Cleanup Plan

Status: Phases 0-4 done and committed (verified: typecheck/lint/tests/build
green, screenshotted at 375/768/1280 after each phase). Phase 4 also fixed a
real navbar overflow bug at the lg breakpoint (1024-1279px) found via manual
review, not caught by the automated document-level overflow check because the
header is `position: fixed`. Phase 5 (blog import) next.

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

## Phase 5 — Blog import (55 articles)

The largest single task, and the biggest SEO win.

- One-off script: parse each `legacy/blog/*.html` with `cheerio` → `Post`
  document. Preserve title, publish date, cover image, body (as Tiptap JSON so
  it is editable in admin), and **the original slug** so the 301s resolve.
- 55 indexed URLs currently 301 into 404s. After import they 301 into real pages.
- `cheerio` is a new dev dependency, used once, then removed from the runtime.
- Verification: script asserts all 55 old URLs return 301 → 200.

## Phase 6 — Admin UI

The architecture here is good — config-driven resources, a generic `DataTable`,
one `ResourceForm`. It does not need replacing. It needs finishing.

- Fix the `text-foreground` no-op (Phase 1) — this alone repairs the sidebar
  active/hover states and every heading.
- **Dashboard**: it is already close. Tighten hierarchy — enquiries needing
  action first, then content health, then quick actions. Drop the
  `View Site` pill duplication.
- **Theme flash**: the dark-mode class is applied in `useEffect`, so the admin
  flashes light on every load. Move to an inline pre-hydration script.
- **Media library** renders through the generic table with a `url` column. It
  needs a grid.
- **Session staleness**: deactivating a user or changing their role has no effect
  for up to 8 hours (JWT, no per-request DB check). Worth a DB lookup in the
  `jwt` callback.
- Consistent spacing/typography pass across every resource page, not just the
  dashboard.
- `usersConfig` has `fields: []` and relies on separate dedicated routes —
  harmless but inconsistent; fold it into the same config shape.

## Phase 7 — Wire up what was built but never connected

Three modules exist, are correct, and are called by nothing:

1. **`lib/seo/jsonld.ts`** — 8 schema builders, zero imports. Meanwhile
   hand-written `@context` blobs were inlined into `(public)/page.tsx` and
   `blog/[slug]/page.tsx`. Replace the blobs with the builders.
2. **`lib/redirects.ts`** — `findRedirect` is never called. The `Redirect` model,
   `/api/redirects` CRUD and the admin "Redirects" nav item all exist, so editors
   can create redirects that silently do nothing. Middleware can't reach Mongo
   (Edge), so this needs a root `[...slug]` catch-all consulted before `notFound()`.
3. **`lib/notify.ts`** — a `TODO` stub. Leads are stored but nobody is emailed.
   For a lead-generation site this is the highest-impact functional gap.

Also: `GET /api/media/[id]` is missing, and `POST /api/upload/sign` has no caller.

## Phase 8 — Cleanup report *(script only — I will not run it)*

Per your instruction, this produces `cleanup.sh` plus a reviewed inventory. Every
entry below was verified by grep or md5, not inferred.

**Exact byte-duplicates** (md5-verified identical directories):
- `public/assets/images/project/` == `projects/` (11 files)
- `public/assets/images/services/` == `service/` (14 files)
- root `assets/` — all 283 unique files are byte-identical to files already in
  `public/assets/`. Zero unique bytes.

**Zero references from `src/`** (grepped each):
- 22 theme image directories: `about/ award/ backgrounds/ bg/ blog/ brands/
  choose/ cta/ faq/ footer/ funfact/ header/ hero/ icon/ icons/ logos/ marquee/
  product/ shape/ shapes/ strategy/ team/ testimonial/` — 283 files
- `public/assets/css/`, `js/`, `vendors/` — ~109 files, loaded by nothing
- Only 21 of 380 images under `public/assets/images/` are actually referenced

**Serving a crash dump publicly:** `public/assets/images/bash.exe.stackdump`.

**Purchased-theme demo content:** `cart/` (42 MB), `demo/` (27 MB).

**Dead npm deps** (zero imports, verified): `react-hook-form`,
`@hookform/resolvers`, `next-themes`, `slugify`, `@radix-ui/react-dropdown-menu`,
`@radix-ui/react-switch`.
*Keep despite appearing unused:* `@tiptap/pm` (peer), `sharp` (dynamic import in
`storage.ts:86`), `dotenv` (side-effect import in 3 scripts), `react-dom` (peer).

**Dead code:** `DashboardSkeleton` and `FormSkeleton` in `states.tsx`,
`paginationQuerySchema` alias in `validation/common.ts`.
*Not dead, despite appearances:* `states.tsx` vs `error-state.tsx` is a barrel
re-export plus its implementation, split so `states.tsx` avoids a `"use client"`
boundary. Both are live. Keep both.

**Guard before deleting any image:** check production for rows pointing at them —
`db.<coll>.find({"coverImage.url": /assets\/images\//})`. The admin media picker
reads the `Media` collection, not the filesystem, so nothing *new* can reference
these, but pre-existing rows can.

Total recoverable: ~103 MB, all restorable from git history.

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
