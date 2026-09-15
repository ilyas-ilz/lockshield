# Lock Shield — Full-Stack Next.js Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Lock Shield from a static-HTML site plus a separate Next.js admin into one Next.js 15 App Router application, with media uploads that work without any external API keys.

**Architecture:** The existing backend (12 REST resources, Zod validation, RBAC, pagination, 66 passing tests) stays as-is. Four plans build on top of it: storage first (it is the only thing currently broken), then admin polish, then the public frontend, then content migration. Uploads use a two-path storage adapter — direct-to-Cloudinary when keys exist, local disk behind a Node route handler when they do not.

**Tech Stack:** Next.js 15.1 (App Router), React 19, TypeScript 5.7, Mongoose 8, MongoDB Atlas, Auth.js 5 beta, Zod 3, Tailwind 4, Vitest 2 + mongodb-memory-server, Cloudinary (optional), Tiptap (Plan 02).

---

## Global Constraints

Every task in every plan inherits these.

- **Node runtime for anything touching Mongoose.** Mongoose is Node-only. Any route handler, page or middleware that reaches the database must not run on Edge.
- **Next.js is 15.1.0.** Node-runtime middleware does not exist in this version. Do not write `export const runtime = "nodejs"` in `middleware.ts`.
- **Serverless request body ceiling is 4.5 MB.** Anything uploaded *through* our own API must cap below it.
- **Every API response uses the `lib/http.ts` envelope** — `{ success: true, data }` or `{ success: false, error }`. Use `ok()`, `created()`, `noContent()`, `ApiError`, and wrap handlers in `handleApi()`.
- **Every mutating route calls `requireRole(...)` and `writeAudit(...)`.** Follow the pattern in `src/app/api/media/route.ts`.
- **Tests use `src/tests/mongo-test-helper.ts`** (`startTestDB` / `stopTestDB` / `clearTestDB`) and go through the real `connectDB()`. Mock only `@/lib/auth`'s `auth()` when a session is needed — never mock `lib/rbac` itself.
- **Test files match `src/**/*.test.ts`** (see `vitest.config.ts`). The `@` alias resolves to `src`.
- **Alt text is required on every image.** It is an accessibility and image-SEO requirement already enforced by the `Media` model and `ImagePicker`.
- **Commit after every task.** Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

---

# Part A — Corrected Architecture Decisions

These are the fixes to the original plan. They are binding on all four plans.

### D1. Local uploads live outside `public/`, served by a route handler

The original plan wrote uploads to `backend/public/uploads/`. That fails two ways on a serverless host: the filesystem is read-only outside `/tmp`, so the write throws `EROFS` (not "files vanish on redeploy"), and `public/` is snapshotted into a static manifest at build time, so anything written there at runtime is never served regardless.

Local uploads write to `UPLOAD_DIR` (default `backend/var/uploads`, gitignored) and are served by `GET /uploads/[...path]` — a Node-runtime route handler that streams from disk. Identical behaviour in `next dev`, `next start`, a VPS, or a container. On a read-only serverless host local mode is unavailable by design, and Cloudinary keys are required.

### D2. Two upload paths, chosen by the server

- **Cloudinary configured** → browser uploads direct to Cloudinary using the existing signed-params flow (`/api/upload/sign` + `lib/cloudinary.ts`). That flow already exists and is correct — its whole purpose is bypassing the 4.5 MB body ceiling. It is kept, not replaced.
- **No Cloudinary keys** → browser POSTs `multipart/form-data` to `/api/upload`; the server writes to `UPLOAD_DIR`.

`GET /api/upload/config` reports the active mode. `ImagePicker` reads it once and branches. Size caps differ by path deliberately: **4 MB** for the proxy path, **10 MB** for the direct Cloudinary path.

### D3. `publicId` must become `sparse`, and the live index dropped

`src/models/Media.ts` declares `publicId: { required: true, unique: true }`. Making it optional while leaving `unique: true` alone means the **second** local upload throws `E11000` — Mongo treats a missing field as `null`, and a plain unique index admits only one `null`. It must be `{ unique: true, sparse: true }`. Mongoose never alters an index that already exists, so `publicId_1` must be dropped by hand on any database that already has it.

### D4. No SVG uploads

`image/svg+xml` served from our own origin is a stored-XSS vector — an SVG can carry `<script>`. Whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`. SVG logos get committed to `public/assets/` by a developer instead.

### D5. Legacy redirects split in two — middleware cannot reach Mongo

`middleware.ts` runs on Edge; Mongoose is Node-only; Next 15.1 has no Node middleware. The existing comment in `src/middleware.ts` already documents exactly this.

- **Static legacy map** (`.html` → clean URL) → `middleware.ts`, edge-safe object lookup.
- **Admin-managed DB redirects** (`lib/redirects.ts`) → root catch-all `app/[...slug]/page.tsx`, consulted before `notFound()`, Node runtime.

### D6. Middleware matcher must use the lookahead form

`"/:path*.html"` is not valid path-to-regexp and matches nothing.

```ts
export const config = {
  matcher: ["/admin/:path*", "/((?!api|_next/static|_next/image|assets|uploads|favicon.ico).*)"],
};
```

### D7. ISR, not `generateStaticParams`, until Atlas is live

`generateStaticParams()` runs at build time and needs a reachable database. `.env` currently points at `mongodb://127.0.0.1:27017`, so any build on a host without that Mongo yields empty params or a hard failure. Public pages use `export const revalidate = 300`. Static generation is reconsidered only once the database is on Atlas and reachable from the build environment.

### D8. Blog redirects are in scope, not an open question

`/blog/` holds **55** indexed HTML files. The original redirect map covered 12 top-level pages and zero blog posts. All 55 need `/blog/<slug>.html → /blog/<slug>`, generated from the directory listing rather than hand-typed.

### D9. Tiptap JSON needs a server-side renderer

The models store Tiptap JSON, and the original plan listed "no new dependencies" for the public frontend. Rendering that JSON in a Server Component needs `@tiptap/html`'s `generateHTML()` with the *same* extension list the editor uses, plus sanitisation before `dangerouslySetInnerHTML`. Plan 02 must export that extension list from a shared module so Plan 03 imports the identical one.

### D10. Answers to the original plan's open questions

- **Mongo hosting → Atlas.** `.env.example` already documents the Atlas URI format. Local Mongo blocks deploys, blocks ISR revalidation from a hosted runtime, and blocks D7 permanently. Migrated in Task 1.
- **Domain → subdomain first** (`new.lockshield.ae`). A 67-entry redirect map cannot be verified on the live domain without serving real 404s to real traffic.
- **Blog content → auto-import.** 55 indexed pages is weeks of manual re-entry and loses publish dates. One-shot `cheerio` → Tiptap JSON script in Plan 04.

### What the original plan got right

Phasing order, the local-first/Cloudinary-upgrade concept, the design-token inventory, the block engine reuse, and the claim that the backend is complete. Verified: `npx vitest run` → 7 files, **66/66 passing**. `nanoid`, `@radix-ui/react-dialog` and `sonner` are already installed. `lib/seo/jsonld.ts`, `lib/redirects.ts`, `robots.ts`, `sitemap.ts` all exist as described.

One caveat on the test claim: all 66 are unit-level (helpers, block schemas, the CRUD handler factory). No test exercises a real route handler end to end. Plan 01 adds the first ones, for the new code with the widest attack surface.

---

# Part B — Plan 01: Storage & Uploads

**Ships:** image upload that works on a fresh clone with zero external keys, automatically upgrading to Cloudinary when keys are present. Plus the version-control baseline everything else depends on.

## File Structure

| Path | Responsibility |
|---|---|
| `../.gitignore` *(repo root, create)* | Excludes `node_modules`, `.next`, `.env`, `backend/var/` |
| `src/lib/env.ts` *(modify)* | Add `UPLOAD_DIR` var and `hasCloudinary()` |
| `src/lib/__tests__/env.test.ts` *(create)* | Tests for `hasCloudinary()` |
| `src/models/Media.ts` *(modify)* | `publicId` optional + sparse; add `storage`, `mimeType` |
| `src/models/__tests__/Media.test.ts` *(create)* | Index behaviour under real Mongo |
| `src/lib/storage.ts` *(create)* | The only upload entry point. Validation + local write + Cloudinary delegate |
| `src/lib/__tests__/storage.test.ts` *(create)* | Validation rules, local write, path safety |
| `src/app/uploads/[...path]/route.ts` *(create)* | Serves files from `UPLOAD_DIR`; traversal-safe |
| `src/app/api/upload/route.ts` *(create)* | `POST` multipart → storage → `Media` doc |
| `src/app/api/upload/config/route.ts` *(create)* | `GET` → `{ mode, maxBytes, accept }` |
| `src/app/api/upload/__tests__/upload.test.ts` *(create)* | RBAC, MIME, size, happy path |
| `src/app/api/media/route.ts` *(modify)* | `publicId` optional in the record schema |
| `src/components/admin/fields/ImagePicker.tsx` *(modify)* | Mode-aware upload, drag-drop, progress |
| `next.config.ts` *(modify)* | `serverExternalPackages: ["sharp"]` |
| `.env.example` *(modify)* | Document `UPLOAD_DIR` and the keyless default |

## Interfaces produced by this plan

Later plans consume these exact signatures.

```ts
// src/lib/storage.ts
export type StorageKind = "local" | "cloudinary";

export interface UploadResult {
  url: string;          // "/uploads/2026/09/V1StGX.webp" or an https:// Cloudinary URL
  publicId?: string;    // Cloudinary only
  storage: StorageKind;
  mimeType: string;
  format: string;       // "webp", "png", ...
  bytes: number;
  width?: number;
  height?: number;
}

export const ALLOWED_MIME_TYPES: readonly string[];
export const MAX_PROXY_UPLOAD_BYTES: number; // 4 * 1024 * 1024

export function assertUploadAllowed(mimeType: string, bytes: number): void; // throws ApiError
export function activeStorage(): StorageKind;
export function uploadRoot(): string;
export async function uploadFile(file: File, folder: string): Promise<UploadResult>;
```

```ts
// GET /api/upload/config  ->  { mode: StorageKind; maxBytes: number; accept: string[] }
// POST /api/upload        ->  multipart { file, alt?, folder? } -> 201 { Media document }
```

---

### Task 1: Version control and database baseline

Nothing else in this plan is safe without it. `D:\Projects\lockshield.ae` is **not** a git repository, and a 15-page frontend rewrite plus a 27 MB asset move with no version control is the single largest risk in the whole project.

**Files:**
- Create: `../.gitignore` (repo root)
- Modify: `.env` (the `MONGODB_URI` line only)

- [ ] **Step 1: Confirm there is no repo yet**

```bash
cd /d/Projects/lockshield.ae
git rev-parse --is-inside-work-tree
```

Expected: `fatal: not a git repository (or any of the parent directories): .git`

If it prints `true`, skip to Step 5.

- [ ] **Step 2: Write the root `.gitignore`**

Create `D:\Projects\lockshield.ae\.gitignore`:

```gitignore
# dependencies
node_modules/

# next
.next/
out/
*.tsbuildinfo

# env
.env
.env.local
.env*.local

# local upload storage (see plan.md D1)
backend/var/

# os / editor
.DS_Store
Thumbs.db
*.stackdump
.playwright-mcp/
```

- [ ] **Step 3: Initialise and make the first commit**

```bash
cd /d/Projects/lockshield.ae
git init -b main
git add -A
git commit -m "chore: initial commit of static site and Next.js backend"
```

Expected: a commit summary listing several hundred files. `assets/` (27 MB) and the `blog/` HTML are included on purpose — they are the source material for Plan 04.

- [ ] **Step 4: Verify nothing secret was committed**

```bash
git ls-files | grep -E "(^|/)\.env$"
```

Expected: **no output**. If `.env` appears, run `git rm --cached backend/.env` and amend the commit before continuing.

- [ ] **Step 5: Move the database to Atlas**

Create a free M0 cluster at <https://cloud.mongodb.com>, add a database user, and allowlist your IP (or `0.0.0.0/0` for development). Then edit `backend/.env`:

```bash
# before: MONGODB_URI=mongodb://127.0.0.1:27017/lockshield
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/lockshield?retryWrites=true&w=majority
```

Rationale in D7 and D10 — local Mongo makes ISR and every deploy impossible.

- [ ] **Step 6: Verify the app still connects and re-seed**

```bash
cd /d/Projects/lockshield.ae/backend
npm run doctor
npm run seed
```

Expected: `doctor` reports a successful connection; `seed` reports the admin user and settings created or already present.

- [ ] **Step 7: Commit**

```bash
cd /d/Projects/lockshield.ae
git add .gitignore
git commit -m "chore: add root gitignore and move database to Atlas"
```

---

### Task 2: `Media` model — sparse `publicId`, `storage` and `mimeType`

**Files:**
- Modify: `src/models/Media.ts`
- Test: `src/models/__tests__/Media.test.ts`

**Interfaces:**
- Produces: `IMedia` gains `publicId?: string`, `storage: "local" | "cloudinary"`, `mimeType?: string`.

- [ ] **Step 1: Write the failing test**

Create `src/models/__tests__/Media.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Types } from "mongoose";
import { startTestDB, stopTestDB, clearTestDB } from "../../tests/mongo-test-helper";
import { Media } from "../Media";

const uploader = new Types.ObjectId();

describe("Media model", () => {
  beforeAll(async () => {
    await startTestDB();
    // WHY explicit: Mongoose builds indexes lazily in the background, so a
    // unique-index test can otherwise pass by racing ahead of the index.
    await Media.init();
  });
  afterAll(stopTestDB);
  beforeEach(clearTestDB);

  it("stores a local upload with no publicId", async () => {
    const media = await Media.create({
      url: "/uploads/2026/09/a.webp",
      alt: "A fire extinguisher",
      storage: "local",
      mimeType: "image/webp",
      uploadedBy: uploader,
    });
    expect(media.publicId).toBeUndefined();
    expect(media.storage).toBe("local");
  });

  it("allows MANY local uploads with no publicId (sparse unique index)", async () => {
    const base = { alt: "x", storage: "local" as const, mimeType: "image/webp", uploadedBy: uploader };
    await Media.create({ ...base, url: "/uploads/2026/09/a.webp" });
    await Media.create({ ...base, url: "/uploads/2026/09/b.webp" });
    await expect(Media.create({ ...base, url: "/uploads/2026/09/c.webp" })).resolves.toBeDefined();
    expect(await Media.countDocuments()).toBe(3);
  });

  it("still rejects a duplicate Cloudinary publicId", async () => {
    const base = { alt: "x", storage: "cloudinary" as const, uploadedBy: uploader };
    await Media.create({ ...base, url: "https://res.cloudinary.com/x/a.webp", publicId: "lockshield/media/a" });
    await expect(
      Media.create({ ...base, url: "https://res.cloudinary.com/x/b.webp", publicId: "lockshield/media/a" })
    ).rejects.toThrow();
  });

  it("defaults storage to local", async () => {
    const media = await Media.create({ url: "/uploads/x.webp", alt: "x", uploadedBy: uploader });
    expect(media.storage).toBe("local");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
cd /d/Projects/lockshield.ae/backend
npx vitest run src/models/__tests__/Media.test.ts
```

Expected: FAIL. The first test fails on `Path 'publicId' is required.`, and the second would fail with `E11000 duplicate key error ... publicId: null` — this is exactly the bug described in D3.

- [ ] **Step 3: Implement the schema change**

In `src/models/Media.ts`, replace the interface and schema fields:

```ts
export type MediaStorage = "local" | "cloudinary";

export interface IMedia extends Document {
  url: string;
  /** Cloudinary only. Absent for local-disk uploads — see plan.md D1/D3. */
  publicId?: string;
  storage: MediaStorage;
  mimeType?: string;
  alt: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    // WHY sparse: local uploads have no publicId, and a plain unique index
    // treats every missing value as the same `null` — so the second local
    // upload would collide with the first. sparse skips missing values.
    publicId: { type: String, unique: true, sparse: true },
    storage: { type: String, enum: ["local", "cloudinary"], default: "local", required: true },
    mimeType: String,
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
mediaSchema.index({ createdAt: -1 });
```

Also update the doc comment above `IMedia` — it currently says "every Cloudinary asset"; it is now every asset from either backend.

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
npx vitest run src/models/__tests__/Media.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Drop the stale index on the real database**

Mongoose will **not** alter an index that already exists, so the Atlas database still carries the old non-sparse `publicId_1`. Drop it once:

```bash
cd /d/Projects/lockshield.ae/backend
npx tsx -e "import mongoose from 'mongoose'; import 'dotenv/config'; const c = await mongoose.connect(process.env.MONGODB_URI); const idx = await c.connection.db.collection('media').indexes(); console.log(idx.map(i => i.name)); await c.connection.db.collection('media').dropIndex('publicId_1').catch(e => console.log('already gone:', e.message)); await mongoose.disconnect();"
```

Expected: prints the index list, then either drops `publicId_1` or reports `already gone:`. The correct sparse index is rebuilt automatically on next boot.

- [ ] **Step 6: Run the whole suite**

```bash
npx vitest run
```

Expected: `Tests  70 passed (70)`.

- [ ] **Step 7: Commit**

```bash
cd /d/Projects/lockshield.ae
git add backend/src/models/Media.ts backend/src/models/__tests__/Media.test.ts
git commit -m "fix: make Media.publicId sparse and add storage/mimeType fields"
```

---

### Task 3: `hasCloudinary()` and `UPLOAD_DIR` in env

**Files:**
- Modify: `src/lib/env.ts`
- Test: `src/lib/__tests__/env.test.ts`

**Interfaces:**
- Produces: `hasCloudinary(): boolean`, and `getEnv().UPLOAD_DIR: string`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/env.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";

// WHY re-import per test: getEnv() memoises its parse, and hasCloudinary()
// reads through it — a module-level import would freeze the first env we set.
async function freshEnv() {
  const mod = await import(`../env?t=${Date.now()}`);
  return mod as typeof import("../env");
}

const ORIGINAL = { ...process.env };

describe("hasCloudinary", () => {
  beforeEach(() => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long-000000";
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });
  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("is false when no Cloudinary vars are set", async () => {
    const { hasCloudinary } = await freshEnv();
    expect(hasCloudinary()).toBe(false);
  });

  it("is false when only some Cloudinary vars are set", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    const { hasCloudinary } = await freshEnv();
    expect(hasCloudinary()).toBe(false);
  });

  it("is true when all three Cloudinary vars are set", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "secret";
    const { hasCloudinary } = await freshEnv();
    expect(hasCloudinary()).toBe(true);
  });

  it("defaults UPLOAD_DIR to var/uploads", async () => {
    const { getEnv } = await freshEnv();
    expect(getEnv().UPLOAD_DIR).toBe("var/uploads");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
npx vitest run src/lib/__tests__/env.test.ts
```

Expected: FAIL with `hasCloudinary is not a function`.

- [ ] **Step 3: Implement**

In `src/lib/env.ts`, add to `envSchema` after `CLOUDINARY_API_SECRET`:

```ts
  // WHY a plain relative dir, not public/: files written under public/ at
  // runtime are never served — that directory is snapshotted into a static
  // manifest at build time. See plan.md D1. Served by app/uploads/[...path].
  UPLOAD_DIR: z.string().min(1).default("var/uploads"),
```

And append at the end of the file:

```ts
/**
 * True only when all three Cloudinary credentials are present. Storage picks
 * its backend from this: Cloudinary when configured, local disk otherwise —
 * so a fresh clone can upload images with no external accounts at all.
 */
export function hasCloudinary(): boolean {
  const env = getEnv();
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
npx vitest run src/lib/__tests__/env.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd /d/Projects/lockshield.ae
git add backend/src/lib/env.ts backend/src/lib/__tests__/env.test.ts
git commit -m "feat: add hasCloudinary() and UPLOAD_DIR to env"
```

---

### Task 4: The storage adapter

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: `hasCloudinary()`, `getEnv()` from Task 3; `ApiError` from `lib/http`.
- Produces: `UploadResult`, `StorageKind`, `ALLOWED_MIME_TYPES`, `MAX_PROXY_UPLOAD_BYTES`, `assertUploadAllowed()`, `activeStorage()`, `uploadFile()` — exactly as listed in "Interfaces produced by this plan" above.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ORIGINAL = { ...process.env };
let dir: string;

async function freshStorage() {
  return (await import(`../storage?t=${Date.now()}`)) as typeof import("../storage");
}

describe("storage", () => {
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "ls-upload-"));
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long-000000";
    process.env.UPLOAD_DIR = dir;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    process.env = { ...ORIGINAL };
  });

  it("reports local mode when Cloudinary is unconfigured", async () => {
    const { activeStorage } = await freshStorage();
    expect(activeStorage()).toBe("local");
  });

  it("reports cloudinary mode when all keys are present", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "123";
    process.env.CLOUDINARY_API_SECRET = "secret";
    const { activeStorage } = await freshStorage();
    expect(activeStorage()).toBe("cloudinary");
  });

  it("rejects a disallowed MIME type with 415", async () => {
    const { assertUploadAllowed } = await freshStorage();
    expect(() => assertUploadAllowed("application/pdf", 100)).toThrowError(/Unsupported file type/);
  });

  it("rejects SVG specifically (stored-XSS vector)", async () => {
    const { assertUploadAllowed } = await freshStorage();
    expect(() => assertUploadAllowed("image/svg+xml", 100)).toThrowError(/Unsupported file type/);
  });

  it("rejects a file over the proxy size cap with 413", async () => {
    const { assertUploadAllowed, MAX_PROXY_UPLOAD_BYTES } = await freshStorage();
    expect(() => assertUploadAllowed("image/png", MAX_PROXY_UPLOAD_BYTES + 1)).toThrowError(/too large/);
  });

  it("accepts an allowed type under the cap", async () => {
    const { assertUploadAllowed } = await freshStorage();
    expect(() => assertUploadAllowed("image/webp", 1024)).not.toThrow();
  });

  it("writes a local file and returns a servable /uploads URL", async () => {
    const { uploadFile } = await freshStorage();
    const file = new File([new Uint8Array([1, 2, 3, 4])], "photo.png", { type: "image/png" });

    const result = await uploadFile(file, "media");

    expect(result.storage).toBe("local");
    expect(result.publicId).toBeUndefined();
    expect(result.bytes).toBe(4);
    expect(result.format).toBe("png");
    expect(result.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[A-Za-z0-9_-]+\.png$/);

    const onDisk = path.join(dir, result.url.replace("/uploads/", ""));
    expect(existsSync(onDisk)).toBe(true);
    expect(readFileSync(onDisk)).toEqual(Buffer.from([1, 2, 3, 4]));
  });

  it("never derives the stored filename from user input", async () => {
    const { uploadFile } = await freshStorage();
    const file = new File([new Uint8Array([9])], "../../etc/passwd.png", { type: "image/png" });
    const result = await uploadFile(file, "media");
    expect(result.url).not.toContain("..");
    expect(result.url).not.toContain("passwd");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
npx vitest run src/lib/__tests__/storage.test.ts
```

Expected: FAIL — `Failed to resolve import "../storage"`.

- [ ] **Step 3: Implement the adapter**

Create `src/lib/storage.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { getEnv, hasCloudinary } from "./env";
import { ApiError } from "./http";
import { createSignedUploadParams } from "./cloudinary";

export type StorageKind = "local" | "cloudinary";

export interface UploadResult {
  url: string;
  publicId?: string;
  storage: StorageKind;
  mimeType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

// WHY no image/svg+xml: an SVG served from our own origin can carry a
// <script> tag and run as first-party JavaScript — a stored XSS. SVG logos
// are committed to public/assets/ by a developer instead. See plan.md D4.
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

// WHY 4MB and not 10: this path proxies the file through our own API route,
// and a serverless request body tops out at 4.5MB. Bigger files go through
// the direct-to-Cloudinary path instead. See plan.md D2.
export const MAX_PROXY_UPLOAD_BYTES = 4 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function activeStorage(): StorageKind {
  return hasCloudinary() ? "cloudinary" : "local";
}

/** Throws ApiError(415) or ApiError(413). Call before touching the bytes. */
export function assertUploadAllowed(mimeType: string, bytes: number): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new ApiError(415, `Unsupported file type "${mimeType}". Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`);
  }
  if (bytes > MAX_PROXY_UPLOAD_BYTES) {
    throw new ApiError(413, `File too large (${Math.round(bytes / 1024)}KB). Maximum is ${MAX_PROXY_UPLOAD_BYTES / 1024 / 1024}MB.`);
  }
}

/** Absolute path to the local upload root, resolved from UPLOAD_DIR. */
export function uploadRoot(): string {
  return path.resolve(process.cwd(), getEnv().UPLOAD_DIR);
}

/**
 * The single entry point for every upload. Local disk when Cloudinary is
 * unconfigured, Cloudinary when it is — callers never branch on it.
 */
export async function uploadFile(file: File, folder: string): Promise<UploadResult> {
  const bytes = file.size;
  const mimeType = file.type;
  assertUploadAllowed(mimeType, bytes);

  if (activeStorage() === "cloudinary") {
    return uploadToCloudinary(file, folder, mimeType, bytes);
  }
  return uploadToLocalDisk(file, mimeType, bytes);
}

async function uploadToLocalDisk(file: File, mimeType: string, bytes: number): Promise<UploadResult> {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const format = EXTENSION_BY_MIME[mimeType];

  // WHY the filename is generated, never taken from file.name: a name like
  // "../../etc/passwd.png" would otherwise escape the upload root.
  const filename = `${nanoid(12)}.${format}`;
  const dir = path.join(uploadRoot(), year, month);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return {
    url: `/uploads/${year}/${month}/${filename}`,
    storage: "local",
    mimeType,
    format,
    bytes,
  };
}

async function uploadToCloudinary(file: File, folder: string, mimeType: string, bytes: number): Promise<UploadResult> {
  const sign = createSignedUploadParams(`lockshield/${folder}`);
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const body = await res.json();
  if (!res.ok) throw new ApiError(502, body?.error?.message ?? "Cloudinary upload failed");

  return {
    url: body.secure_url,
    publicId: body.public_id,
    storage: "cloudinary",
    mimeType,
    format: body.format ?? EXTENSION_BY_MIME[mimeType],
    bytes: body.bytes ?? bytes,
    width: body.width,
    height: body.height,
  };
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
npx vitest run src/lib/__tests__/storage.test.ts
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
cd /d/Projects/lockshield.ae
git add backend/src/lib/storage.ts backend/src/lib/__tests__/storage.test.ts
git commit -m "feat: add local-first storage adapter with Cloudinary upgrade"
```

---

### Task 5: Serve local uploads over HTTP

Without this, a local upload succeeds but the resulting `/uploads/...` URL 404s.

**Files:**
- Create: `src/app/uploads/[...path]/route.ts`
- Test: `src/app/uploads/__tests__/serve.test.ts`

**Interfaces:**
- Consumes: `uploadRoot()` from Task 4.

- [ ] **Step 1: Write the failing test**

Create `src/app/uploads/__tests__/serve.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ORIGINAL = { ...process.env };
let dir: string;

async function freshRoute() {
  return (await import(`../[...path]/route?t=${Date.now()}`)) as typeof import("../[...path]/route");
}

describe("GET /uploads/[...path]", () => {
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "ls-serve-"));
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long-000000";
    process.env.UPLOAD_DIR = dir;
    mkdirSync(path.join(dir, "2026", "09"), { recursive: true });
    writeFileSync(path.join(dir, "2026", "09", "abc.png"), Buffer.from([137, 80, 78, 71]));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    process.env = { ...ORIGINAL };
  });

  it("serves an existing file with the right content type", async () => {
    const { GET } = await freshRoute();
    const res = await GET(new Request("http://localhost/uploads/2026/09/abc.png"), {
      params: Promise.resolve({ path: ["2026", "09", "abc.png"] }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(await res.arrayBuffer())).toEqual(Buffer.from([137, 80, 78, 71]));
  });

  it("404s an unknown file", async () => {
    const { GET } = await freshRoute();
    const res = await GET(new Request("http://localhost/uploads/nope.png"), {
      params: Promise.resolve({ path: ["nope.png"] }),
    });
    expect(res.status).toBe(404);
  });

  it("refuses to escape the upload root", async () => {
    const { GET } = await freshRoute();
    const res = await GET(new Request("http://localhost/uploads/x"), {
      params: Promise.resolve({ path: ["..", "..", "package.json"] }),
    });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
npx vitest run src/app/uploads/__tests__/serve.test.ts
```

Expected: FAIL — cannot resolve `../[...path]/route`.

- [ ] **Step 3: Implement the handler**

Create `src/app/uploads/[...path]/route.ts`:

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadRoot } from "@/lib/storage";

// WHY a route handler and not public/: files written under public/ at runtime
// are never served — that directory is baked into a static manifest at build
// time. See plan.md D1. Node runtime because it reads the filesystem.
export const runtime = "nodejs";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const root = uploadRoot();
  const target = path.resolve(root, ...segments);

  // WHY this check: without it, a request for ../../.env reads any file the
  // process can. path.resolve has already collapsed the traversal, so a
  // prefix comparison against the root is a reliable containment test.
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPE_BY_EXT[path.extname(target).toLowerCase()];
  if (!contentType) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(target);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        // Filenames are content-addressed by nanoid and never reused, so a
        // long immutable cache is safe.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
npx vitest run src/app/uploads/__tests__/serve.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /d/Projects/lockshield.ae
git add backend/src/app/uploads
git commit -m "feat: serve local uploads from UPLOAD_DIR via route handler"
```

---

### Task 6: `POST /api/upload` and `GET /api/upload/config`

**Files:**
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/api/upload/config/route.ts`
- Modify: `src/app/api/media/route.ts` (make `publicId` optional in `mediaRecordSchema`)
- Test: `src/app/api/upload/__tests__/upload.test.ts`

**Interfaces:**
- Consumes: `uploadFile`, `activeStorage`, `ALLOWED_MIME_TYPES`, `MAX_PROXY_UPLOAD_BYTES` from Task 4; `Media` from Task 2.
- Produces: `POST /api/upload` → `201 { success: true, data: <Media document> }`; `GET /api/upload/config` → `200 { success: true, data: { mode, maxBytes, accept } }`.

- [ ] **Step 1: Write the failing test**

Create `src/app/api/upload/__tests__/upload.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { startTestDB, stopTestDB, clearTestDB } from "../../../../tests/mongo-test-helper";
import { Media } from "@/models/Media";

// Same approach as createCrudHandlers.test.ts: fake only the session lookup
// so the real requireRole() runs.
let currentActor: { id: string; role: "ADMIN" | "EDITOR"; email: string } | null = {
  id: "68d0000000000000000000a1",
  role: "EDITOR",
  email: "editor@test.com",
};
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => (currentActor ? { user: currentActor } : null)) }));

let dir: string;

function multipart(file: File, fields: Record<string, string> = {}) {
  const form = new FormData();
  form.append("file", file);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return new NextRequest("http://localhost/api/upload", { method: "POST", body: form });
}

async function freshRoute() {
  return (await import(`../route?t=${Date.now()}`)) as typeof import("../route");
}

describe("POST /api/upload", () => {
  beforeAll(startTestDB);
  afterAll(stopTestDB);
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "ls-api-upload-"));
    process.env.UPLOAD_DIR = dir;
    currentActor = { id: "68d0000000000000000000a1", role: "EDITOR", email: "editor@test.com" };
  });
  afterEach(async () => {
    rmSync(dir, { recursive: true, force: true });
    await clearTestDB();
  });

  it("401s an anonymous request", async () => {
    currentActor = null;
    const { POST } = await freshRoute();
    const res = await POST(multipart(new File([new Uint8Array([1])], "a.png", { type: "image/png" })));
    expect(res.status).toBe(401);
  });

  it("400s when no file is attached", async () => {
    const { POST } = await freshRoute();
    const res = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: new FormData() }));
    expect(res.status).toBe(400);
  });

  it("415s a disallowed MIME type", async () => {
    const { POST } = await freshRoute();
    const res = await POST(multipart(new File([new Uint8Array([1])], "a.pdf", { type: "application/pdf" })));
    expect(res.status).toBe(415);
  });

  it("415s an SVG", async () => {
    const { POST } = await freshRoute();
    const svg = new File([new Uint8Array([60, 115, 118, 103])], "a.svg", { type: "image/svg+xml" });
    const res = await POST(multipart(svg));
    expect(res.status).toBe(415);
  });

  it("413s a file over the cap", async () => {
    const { POST } = await freshRoute();
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    const res = await POST(multipart(big));
    expect(res.status).toBe(413);
  });

  it("201s and records a Media document on success", async () => {
    const { POST } = await freshRoute();
    const res = await POST(
      multipart(new File([new Uint8Array([1, 2, 3])], "photo.png", { type: "image/png" }), { alt: "A fire panel" })
    );
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.url).toMatch(/^\/uploads\//);
    expect(body.data.storage).toBe("local");
    expect(body.data.alt).toBe("A fire panel");

    expect(await Media.countDocuments()).toBe(1);
  });

  it("falls back to placeholder alt text rather than rejecting", async () => {
    const { POST } = await freshRoute();
    const res = await POST(multipart(new File([new Uint8Array([1])], "photo.png", { type: "image/png" })));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.alt).toBe("Needs alt text");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
npx vitest run src/app/api/upload/__tests__/upload.test.ts
```

Expected: FAIL — cannot resolve `../route`.

- [ ] **Step 3: Implement both routes**

Create `src/app/api/upload/route.ts`:

```ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ApiError, handleApi, created } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { uploadFile } from "@/lib/storage";
import { Media } from "@/models/Media";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// WHY Node runtime: lib/storage writes to the filesystem and Mongoose is
// Node-only. WHY this route exists at all alongside /api/upload/sign: with no
// Cloudinary keys there is nowhere to sign an upload to, so a fresh clone
// proxies the bytes through here instead. See plan.md D2.
export const runtime = "nodejs";

const folderSchema = z.enum(["posts", "pages", "services", "projects", "jobs", "media"]).default("media");

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);
    await connectDB();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new ApiError(400, "No file was attached to the request");
    }

    const folder = folderSchema.parse(form.get("folder") ?? undefined);
    const alt = String(form.get("alt") ?? "").trim() || "Needs alt text";

    const uploaded = await uploadFile(file, folder);
    const media = await Media.create({ ...uploaded, alt, uploadedBy: actor.id });

    await writeAudit({
      user: actor,
      action: "create",
      resource: "Media",
      resourceId: String(media._id),
      ip: getClientIp(req.headers),
    });

    return created(media);
  });
}
```

Create `src/app/api/upload/config/route.ts`:

```ts
import { handleApi, ok } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { activeStorage, ALLOWED_MIME_TYPES, MAX_PROXY_UPLOAD_BYTES } from "@/lib/storage";

export const runtime = "nodejs";

// WHY the client asks instead of guessing: only the server knows whether
// Cloudinary keys exist, and the two paths have different size ceilings —
// 10MB direct to Cloudinary, 4MB proxied through us. See plan.md D2.
const CLOUDINARY_DIRECT_MAX_BYTES = 10 * 1024 * 1024;

export async function GET() {
  return handleApi(async () => {
    await requireRole(...STAFF);
    const mode = activeStorage();
    return ok({
      mode,
      maxBytes: mode === "cloudinary" ? CLOUDINARY_DIRECT_MAX_BYTES : MAX_PROXY_UPLOAD_BYTES,
      accept: [...ALLOWED_MIME_TYPES],
    });
  });
}
```

In `src/app/api/media/route.ts`, `publicId` is now optional — replace the schema:

```ts
const mediaRecordSchema = z.object({
  url: z.string().min(1),
  // Optional: local-disk uploads have no Cloudinary publicId. See plan.md D3.
  publicId: z.string().min(1).optional(),
  storage: z.enum(["local", "cloudinary"]).default("cloudinary"),
  mimeType: z.string().optional(),
  alt: z.string().min(1, "alt text is required"),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
});
```

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
npx vitest run src/app/api/upload/__tests__/upload.test.ts
```

Expected: PASS (7 tests).

- [ ] **Step 5: Run the whole suite and typecheck**

```bash
npx vitest run && npm run typecheck
```

Expected: `Tests  92 passed (92)` and no TypeScript output.

- [ ] **Step 6: Commit**

```bash
cd /d/Projects/lockshield.ae
git add backend/src/app/api/upload backend/src/app/api/media/route.ts
git commit -m "feat: add multipart upload endpoint and storage-mode config route"
```

---

### Task 7: Rewire `ImagePicker`

**Files:**
- Modify: `src/components/admin/fields/ImagePicker.tsx`

**Interfaces:**
- Consumes: `GET /api/upload/config` and `POST /api/upload` from Task 6; the existing `POST /api/upload/sign`.
- Produces: `PickedImage` unchanged — `{ url, publicId?, alt, width?, height? }`. Every consumer of `ImagePicker` keeps working untouched.

There is no unit test here: it is a browser component whose whole job is `XMLHttpRequest` progress and drag events, and a jsdom test of that would assert on the mock rather than on behaviour. It is verified manually in Step 4 and by `npm run build`.

- [ ] **Step 1: Replace the upload logic**

In `src/components/admin/fields/ImagePicker.tsx`, replace everything from the `SignResponse` interface through the end of `handleFile` with:

```tsx
interface UploadConfig {
  mode: "local" | "cloudinary";
  maxBytes: number;
  accept: string[];
}

interface SignResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Uploads an image and registers it in the Media collection.
 *
 * Two paths, chosen by the server (GET /api/upload/config):
 * - cloudinary: browser uploads direct to Cloudinary with a server-issued
 *   signature, because a serverless request body tops out at 4.5MB and
 *   project photos exceed that.
 * - local: no Cloudinary keys configured, so the bytes proxy through
 *   POST /api/upload onto local disk — which is what makes a fresh clone
 *   work with no external accounts at all.
 */
export function ImagePicker({
  value,
  onChange,
}: {
  value: PickedImage | null;
  onChange: (img: PickedImage | null) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState<UploadConfig | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    api.get<UploadConfig>("/api/upload/config").then(setConfig).catch(() => setConfig(null));
  }, []);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const cfg = config ?? (await api.get<UploadConfig>("/api/upload/config"));
      setConfig(cfg);

      if (!cfg.accept.includes(file.type)) {
        throw new Error(`Unsupported file type. Allowed: ${cfg.accept.join(", ")}`);
      }
      if (file.size > cfg.maxBytes) {
        throw new Error(`File is too large. Maximum is ${Math.round(cfg.maxBytes / 1024 / 1024)}MB.`);
      }

      const picked =
        cfg.mode === "cloudinary"
          ? await uploadViaCloudinary(file, value?.alt ?? "", setProgress)
          : await uploadViaApi(file, value?.alt ?? "", setProgress);

      onChange(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }
```

- [ ] **Step 2: Add the two upload helpers and the progress-capable POST**

Add above the `ImagePicker` component:

```tsx
/**
 * WHY XMLHttpRequest and not fetch: fetch exposes no upload-progress events,
 * and a 4MB image on a UAE mobile connection is long enough that a bare
 * spinner reads as a hang.
 */
function postWithProgress<T>(url: string, body: FormData, onProgress: (pct: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      let parsed: { success?: boolean; data?: T; error?: string } | null = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        // Cloudinary and our API both answer JSON; anything else is a proxy error page.
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((parsed && "data" in parsed ? parsed.data : parsed) as T);
      } else {
        reject(new Error(parsed?.error ?? `Upload failed (${xhr.status})`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.send(body);
  });
}

interface MediaDoc {
  url: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
}

async function uploadViaApi(file: File, alt: string, onProgress: (n: number) => void): Promise<PickedImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "media");
  if (alt) form.append("alt", alt);
  const media = await postWithProgress<MediaDoc>("/api/upload", form, onProgress);
  return { url: media.url, publicId: media.publicId, alt: media.alt === "Needs alt text" ? "" : media.alt, width: media.width, height: media.height };
}

async function uploadViaCloudinary(file: File, alt: string, onProgress: (n: number) => void): Promise<PickedImage> {
  const sign = await api.post<SignResponse>("/api/upload/sign", { folder: "media" });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const uploaded = await postWithProgress<{ secure_url: string; public_id: string; width?: number; height?: number; format?: string; bytes?: number }>(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
    form,
    onProgress
  );

  const picked: PickedImage = {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    width: uploaded.width,
    height: uploaded.height,
    alt,
  };

  // Register in our own Media collection so the library can list it later.
  await api
    .post("/api/media", {
      ...picked,
      storage: "cloudinary",
      format: uploaded.format,
      bytes: uploaded.bytes,
      alt: picked.alt || "Needs alt text",
    })
    .catch(() => {});

  return picked;
}
```

- [ ] **Step 3: Add the drop zone and progress bar**

Replace the empty-state `<button>` block with:

```tsx
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-sm transition-colors disabled:opacity-60 cursor-pointer ${
            dragging ? "border-[var(--brand)] bg-surface-2 text-app" : "border-app bg-surface-2/40 text-muted hover:bg-surface-2"
          }`}
        >
          <ImagePlus className="size-5" aria-hidden />
          {uploading ? `Uploading… ${progress}%` : "Click to upload an image, or drop one here"}
          {config && (
            <span className="text-xs text-muted">
              Up to {Math.round(config.maxBytes / 1024 / 1024)}MB · {config.mode === "local" ? "stored locally" : "stored on Cloudinary"}
            </span>
          )}
        </button>

        {uploading && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[var(--brand)] transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        )}

        <input
          ref={fileInput}
          type="file"
          accept={config?.accept.join(",") ?? "image/*"}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
```

- [ ] **Step 4: Verify manually in the running app**

```bash
cd /d/Projects/lockshield.ae/backend
npm run dev
```

With **no** Cloudinary keys in `.env`:
1. Open <http://localhost:3000/admin/posts/new> and log in.
2. Drag a PNG onto the cover-image drop zone. Expected: progress bar fills, thumbnail appears, hint reads "stored locally".
3. Confirm the file landed: `ls backend/var/uploads/2026/09/` shows one nanoid-named file.
4. Confirm it is served: the thumbnail renders, and opening its `/uploads/...` URL directly shows the image.
5. Try a PDF. Expected: inline error "Unsupported file type…", nothing written to disk.
6. Save the post, reopen it. Expected: the image is still attached.

Then add real `CLOUDINARY_*` keys to `.env`, restart `npm run dev`, and repeat step 2. Expected: hint now reads "stored on Cloudinary", and the resulting URL is `https://res.cloudinary.com/...`.

- [ ] **Step 5: Typecheck, build and commit**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: no type errors, no lint errors, build completes.

```bash
cd /d/Projects/lockshield.ae
git add backend/src/components/admin/fields/ImagePicker.tsx
git commit -m "feat: mode-aware image upload with drag-drop and progress"
```

---

### Task 8: Configuration and documentation

**Files:**
- Modify: `.env.example`
- Modify: `next.config.ts`
- Modify: `README.md`

- [ ] **Step 1: Document the keyless default in `.env.example`**

Replace the Cloudinary block:

```bash
# --- Media storage ---
# Leave the Cloudinary vars EMPTY for local-disk storage — uploads then go to
# UPLOAD_DIR and are served by /uploads/*. That is the zero-setup default and
# is fine for development and for any host with a writable disk (VPS, Docker).
#
# Fill all three in for production on a serverless host (Vercel etc.), where
# the filesystem is read-only: uploads then go browser-direct to Cloudinary.
# Partial configuration is treated as unconfigured.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Where local uploads are written, relative to the backend/ directory.
# Gitignored. Not under public/ — see plan.md D1 for why that would not work.
UPLOAD_DIR=var/uploads
```

- [ ] **Step 2: Register `sharp` as a server external package**

In `next.config.ts`, add at the top level of `nextConfig`:

```ts
  // WHY: sharp ships native binaries that must not be bundled by webpack.
  // Next uses it for image optimization, and lib/storage may use it later
  // for server-side dimension detection.
  serverExternalPackages: ["sharp"],
```

- [ ] **Step 3: Install sharp**

```bash
cd /d/Projects/lockshield.ae/backend
npm install sharp
```

It is a real dependency, not an optional one with a silent fallback — a dimension-detection path that sometimes returns `0x0` produces layout shift on the public site and is worse than not having it.

- [ ] **Step 4: Document storage in `README.md`**

Add a `## Media storage` section covering: the two modes and how the mode is chosen; that `var/uploads/` is gitignored and therefore not a backup; that a serverless deployment requires Cloudinary keys; and the `dropIndex('publicId_1')` step for any database created before this change.

- [ ] **Step 5: Full verification**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
```

Expected: `Tests  92 passed (92)`, no type errors, no lint errors, clean build.

- [ ] **Step 6: Commit**

```bash
cd /d/Projects/lockshield.ae
git add backend/.env.example backend/next.config.ts backend/README.md backend/package.json backend/package-lock.json
git commit -m "docs: document storage modes; add sharp as a server external package"
```

---

## Plan 01 — Definition of done

- `npx vitest run` → 92 passing (66 existing + 26 new).
- A fresh clone with no `CLOUDINARY_*` keys can upload an image through the admin and see it render.
- Adding the three Cloudinary keys switches the path with no code change.
- PDFs and SVGs are rejected, oversize files are rejected, and `../` in a filename cannot escape the upload root — all covered by tests.
- The repository exists, everything is committed, and `.env` is not in it.

---

# Part C — Plans 02–04 (scoped, not yet decomposed)

These are deliberately **not** written out at task level yet. Each one's task boundaries depend on what Plan 01 actually produces — the `UploadResult` shape, the `/api/upload/config` contract, the `Media` document shape. Decomposing them now means rewriting them later. Each gets its own task-level pass immediately before it executes.

### Plan 02 — Admin UI modernisation

Tiptap behind a `RichTextEditor` component wired into `FieldInput`'s `case "richtext"`, with the raw-JSON textarea retained as a "Source" toggle. New deps: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder` — all pinned **≥ 2.11** for React 19 support.

**Hard requirement:** the extension list lives in one shared module (`src/lib/tiptap-extensions.ts`), exported for both the editor and Plan 03's server-side `generateHTML()`. Different extension lists on the two sides means content renders differently on the public site than in the editor, silently.

Also: media library modal on the already-installed `@radix-ui/react-dialog`, listing from `GET /api/media` with search by alt text; dashboard stat cards, quick actions and status-coloured lead badges; data-table status filter tabs and bulk delete; tabbed settings page; admin-shell "View live site" link and lead-count badge.

### Plan 03 — Public frontend

Split into four independently shippable chunks — as one unit it is larger than plans 01, 02 and 04 combined.

- **03a** — `(public)` route group, `layout.tsx` split (public marketing shell vs. existing admin shell), `Navbar`, `Footer`, `QuoteModal`, design tokens ported from `assets/css/main.css`, homepage. Tokens: brand red `#e01b24` / dark `#b3121a`, navy `#131b2e`, ink `#0d1220`, paper `#ffffff` / soft `#f7f7f8`; Archivo (400–900) and Chakra Petch (400–700) via `next/font/google`; pill buttons `999px`; cards `18px`–`24px`; floating header with `backdrop-filter: blur(14px)`; blueprint grid overlay.
- **03b** — services index and `[slug]`, projects index and `[slug]` with sector/emirate filtering.
- **03c** — blog index and `[slug]`, career, contact.
- **03d** — per-page metadata, JSON-LD through the existing `lib/seo/jsonld.ts` (`LocalBusiness`, `Article`, `FAQPage`, `JobPosting`), sitemap and robots updates.

Every page uses `export const revalidate = 300` (D7) and the shared Tiptap renderer (D9). `src/app/page.tsx` moves into `(public)/page.tsx`.

### Plan 04 — Redirects and content migration

- Static legacy map in `middleware.ts` (D5), matcher in the lookahead form (D6).
- DB-backed redirects in a root catch-all `app/[...slug]/page.tsx`, consulted before `notFound()` (D5).
- **67 redirect entries**: the 12 top-level `.html` pages plus all **55** `/blog/*.html` posts, the blog set generated from the directory listing rather than hand-typed (D8).
- `cheerio`-based HTML → Tiptap JSON importer preserving titles, publish dates, cover images, bodies and slugs (D10).
- `assets/` (27 MB) copied to `backend/public/assets/`.
- Seed extended with the 6 services, 6 sample projects and 4 blog categories, all `$setOnInsert` idempotent.

**Verification that matters most here:** every one of the 67 old URLs returns `301` to a `200`, checked by script against the running app before the domain is cut over — which is exactly why D10 puts the app on a subdomain first.
