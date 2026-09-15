# Lock Shield — Backend

Next.js 15 (App Router) + MongoDB/Mongoose backend for lockshield.ae: data
models, auth, full CRUD REST API, an admin panel, and the SEO/GEO surface
(sitemap, robots, llms.txt, JSON-LD builders). This is the **backend
phase** — the public marketing site (block renderer, mobile-first design
system) is a separate, later phase that consumes this same API. See
`src/app/page.tsx` for the placeholder root route.

## Stack

- **Next.js 15** App Router — route handlers double as the REST API, Server
  Components render the admin panel.
- **MongoDB + Mongoose 8** — see `src/models/`.
- **Auth.js v5 (next-auth beta)**, Credentials provider, JWT sessions,
  bcrypt, account lockout, per-IP+email rate limiting.
- **Zod** — every write validated at `src/lib/validation/*`.
- **Cloudinary** — signed direct browser upload for images.
- **Tailwind v4** — admin UI only (utility classes, no component library).
- **Vitest + mongodb-memory-server** — real-Mongo integration tests, not mocks.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, AUTH_SECRET (openssl rand -base64 32), Cloudinary keys
npm run seed            # creates the first ADMIN user + Settings singleton
npm run dev              # http://localhost:3000/admin
```

`npm run seed` is idempotent — safe to re-run. It seeds Lock Shield's real
NAP data (address, phone, email) and the `lockshieldcart.com` partner
backlinks into Settings; it does **not** seed content (posts/projects/
pages) — that's real editorial work, done through the admin UI.

## Architecture notes

- **CRUD factory** (`src/lib/api/createCrudHandlers.ts`) — 9 of 12 resources
  (Post, Category, Tag, Page, Service, Project, Job, Redirect, Media) get
  their REST routes from one factory: validate → RBAC → paginate/persist →
  audit log. Settings (singleton), Users (password hashing), and Leads
  (public POST, no auth) are hand-written because their shape genuinely
  differs — see each route file's WHY comment.
- **Block engine** (`src/lib/blocks/schemas.ts`) — Page and Service content
  is an ordered array of 14 typed blocks (Hero, FAQ, Stats, …), not
  freeform HTML. The admin's block editor is schema-driven
  (`src/lib/admin/block-field-configs.ts` + `FieldInput`), so adding a
  block type is a schema entry + a field config, not a bespoke form.
- **Auth split** (`auth.config.ts` vs `auth.ts`) — `middleware.ts` runs on
  the Edge runtime, which can't bundle Mongoose. `auth.config.ts` (session/
  callbacks only, zero DB imports) is the Edge-safe half middleware uses;
  `auth.ts` (Node runtime) adds the Credentials provider's DB-backed
  `authorize()`. Route handlers and Server Components import `auth.ts`.
- **i18n-ready, English-only** — every content model carries `locale` +
  `translationGroupId` per the design decision to ship EN now without a
  future migration to add Arabic.
- **SEO/GEO** — `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts` are
  generated from published content on every request (hourly ISR), so they
  can't drift the way the legacy site's hand-maintained 12-URL sitemap did
  against 40+ actual blog posts. `src/lib/seo/jsonld.ts` builds LocalBusiness/
  Article/FAQPage/JobPosting/etc. schema from Settings + each document.
- **Cart backlinks** — `Settings.partnerLinks` holds real dofollow anchors
  to lockshieldcart.com, rendered in the footer/Organization schema. The
  legacy site's every mention was `href="Email:info@lockshieldcart.com"` —
  a broken pseudo-link passing zero link equity, not an actual backlink.

## Known limitations / deferred work

These are deliberate scope cuts for this phase, not oversights:

- **Rich text editor UI** — Post/Job/Project body fields store real Tiptap
  JSON (the correct data contract), but the admin edits it as a JSON
  textarea until a WYSIWYG is wired in with the frontend/design phase.
- **In-memory rate limiter** (`src/lib/rate-limit.ts`) is per-instance —
  fine for current traffic, but on Vercel's serverless deployment it isn't
  shared across function instances. Swap for Upstash Redis if abuse shows
  up; the call signature is designed to make that a drop-in change.
- **Legacy `.html` redirects** — `src/lib/redirects.ts` (DB-backed lookup)
  exists but isn't wired into `middleware.ts` yet, since there's no public
  frontend to redirect *to* until the next phase. `Redirect` CRUD is fully
  built in the admin, ready to populate ahead of time.
- **Email notifications** (`src/lib/notify.ts`) is a stub that logs —
  which provider (Resend/SendGrid/existing cPanel SMTP) is a "wire it
  later" decision, not an architecture one; the Lead model/route already
  persists every submission regardless.
- **No admin-initiated password reset** — an ADMIN can deactivate/reassign
  a user's role, but resetting a forgotten password needs an email-token
  flow that depends on the same notify.ts decision above. For now, delete
  and recreate the account.
- **Admin UI is functional, not polished** — native `<select>`/`confirm()`,
  component-state pagination (not URL-synced), no design-system
  investment. This is intentional: the "modern, no-slop, mobile-first"
  requirement is for the public site; the backoffice trades polish for
  build speed. Worth a pass against `~/.claude/rules/ui-frontend.md` and
  `listing-pages.md` if the team will use this admin daily long-term.
- **npm audit**: 3 moderate/high advisories remain, all in build/dev
  tooling only (Next's bundled `postcss`, Vitest's `esbuild` dev server) —
  fixing requires a Next 16 / Vitest 5 major bump, deliberately not done
  mid-build. The one critical advisory (`@auth/core`) is patched.
- **Legacy content migration** — the 40 existing blog posts were
  deliberately *not* auto-imported (explicit "start fresh" decision). If
  that changes, an HTML→Mongo importer script is a contained addition —
  Post's schema already matches what's needed.

## Verification performed

Typecheck, lint, and `next build` all pass clean. 55 Vitest tests pass
(lockout, password hashing/strength, block schema validation for all 14
types, pagination math, and a full CRUD-factory integration suite against
real mongodb-memory-server covering create/validate/list/paginate/search/
regex-escaping/get/update/delete/401/403/404/400). Beyond automated tests,
this was smoke-tested against a live local MongoDB with a running dev
server: seed → CSRF → credentials login → session cookie → authenticated
create/list/delete of a real Post, plus unauthenticated requests correctly
returning 401 and public routes (`/sitemap.xml`, `/robots.txt`,
`/llms.txt`) returning 200 with real generated content.
