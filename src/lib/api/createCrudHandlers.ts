import { NextRequest } from "next/server";
import type { Model, FilterQuery } from "mongoose";
import type { ZodSchema } from "zod";
import { connectDB } from "@/lib/db";
import { handleApi, ok, created, noContent, ApiError } from "@/lib/http";
import { requireRole, type SessionUser } from "@/lib/rbac";
import { paginate, resolveSort } from "@/lib/pagination";
import { listQuerySchema, objectIdSchema } from "@/lib/validation/common";
import { writeAudit } from "@/lib/audit";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import type { UserRole } from "@/models/User";

/**
 * Repository/service-layer factory (backend-patterns: "Repository Pattern"
 * + "Service Layer Pattern" collapsed into one, since our service logic
 * *is* validate-then-persist for most resources). Every admin-managed
 * resource (Post, Category, Tag, Page, Service, Project, Job, Redirect,
 * Media) gets its collection + item route handlers from this one factory —
 * real per-resource REST endpoints, without re-writing auth/pagination/
 * validation/audit wiring 9 times. A resource that needs custom behavior
 * (Settings singleton, public Lead intake) gets a hand-written route
 * instead — see app/api/settings and app/api/leads.
 */

export interface CrudConfig<TDoc, TCreate, TUpdate> {
  resourceName: string; // for audit log + error messages, e.g. "Post"
  model: Model<TDoc>;
  createSchema: ZodSchema<TCreate>;
  updateSchema: ZodSchema<TUpdate>;
  readRoles: UserRole[]; // who can GET
  writeRoles: UserRole[]; // who can POST/PATCH/DELETE
  defaultSort?: Record<string, 1 | -1>;
  searchFields?: string[]; // fields OR'd together for ?search= text search
  /** Fields a client may sort by via ?sort=. Anything else falls back to defaultSort — see resolveSort. */
  sortableFields?: readonly string[];
  /** Extra static filter always applied, e.g. scoping to a locale. */
  baseFilter?: FilterQuery<TDoc>;
  /** Hook to mutate/derive fields server-side before create (e.g. stamp author). */
  beforeCreate?: (input: TCreate, actor: SessionUser) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** Hook to mutate/derive fields server-side before update (e.g. stamp publishedAt on draft->published). Receives the existing doc so it can diff against current state. */
  beforeUpdate?: (
    input: TUpdate,
    existing: TDoc,
    actor: SessionUser
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

function buildSearchFilter<TDoc>(q: string | undefined, fields: string[] | undefined): FilterQuery<TDoc> {
  if (!q || !fields || fields.length === 0) return {};
  const escaped = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (char) => "\\" + char);
  const regex = new RegExp(escaped, "i"); // WHY: escape regex metachars in user input — an unescaped `.` or `(` from a search box must never be interpreted as regex syntax against the DB
  return { $or: fields.map((f) => ({ [f]: regex })) } as FilterQuery<TDoc>;
}

export function createCollectionHandlers<TDoc, TCreate, TUpdate>(cfg: CrudConfig<TDoc, TCreate, TUpdate>) {
  async function GET(req: NextRequest) {
    return handleApi(async () => {
      await requireRole(...cfg.readRoles);
      await connectDB();

      const { searchParams } = new URL(req.url);
      const query = listQuerySchema.parse(Object.fromEntries(searchParams));
      const filter: Record<string, unknown> = {
        ...(cfg.baseFilter ?? {}),
        ...buildSearchFilter<TDoc>(query.search, cfg.searchFields),
      };

      const statusParam = searchParams.get("status");
      if (statusParam && statusParam !== "all") {
        const schemaPaths = (cfg.model.schema as unknown as { paths?: Record<string, unknown> })?.paths ?? {};
        if ("publishStatus" in schemaPaths) {
          filter.publishStatus = statusParam;
        } else if ("status" in schemaPaths) {
          filter.status = statusParam;
        }
      }

      const defaultSort = cfg.defaultSort ?? { createdAt: -1 };
      const sort = resolveSort(query.sort, query.order, cfg.sortableFields ?? [], defaultSort);

      const result = await paginate(cfg.model, filter as FilterQuery<TDoc>, {
        page: query.page,
        pageSize: query.pageSize,
        sort,
      });
      return ok({ ...result, sort: query.sort, order: query.order });
    });
  }

  async function POST(req: NextRequest) {
    return handleApi(async () => {
      const actor = await requireRole(...cfg.writeRoles);

      const rl = checkRateLimit(`write:${actor.id}`, RATE_LIMITS.apiWrite.max, RATE_LIMITS.apiWrite.windowMs);
      if (!rl.allowed) throw new ApiError(429, "Too many write requests — slow down");

      await connectDB();
      const body = await req.json();
      const input = cfg.createSchema.parse(body);
      const extra = (await cfg.beforeCreate?.(input, actor)) ?? {};

      const doc = await cfg.model.create({ ...input, ...extra });
      await writeAudit({
        user: actor,
        action: "create",
        resource: cfg.resourceName,
        resourceId: String(doc._id),
        ip: getClientIp(req.headers),
      });
      return created(doc);
    });
  }

  return { GET, POST };
}

export function createItemHandlers<TDoc, TCreate, TUpdate>(cfg: CrudConfig<TDoc, TCreate, TUpdate>) {
  async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return handleApi(async () => {
      await requireRole(...cfg.readRoles);
      await connectDB();
      const { id } = await params;
      objectIdSchema.parse(id);
      const doc = await cfg.model.findById(id);
      if (!doc) throw new ApiError(404, `${cfg.resourceName} not found`);
      return ok(doc);
    });
  }

  async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return handleApi(async () => {
      const actor = await requireRole(...cfg.writeRoles);
      const rl = checkRateLimit(`write:${actor.id}`, RATE_LIMITS.apiWrite.max, RATE_LIMITS.apiWrite.windowMs);
      if (!rl.allowed) throw new ApiError(429, "Too many write requests — slow down");

      await connectDB();
      const { id } = await params;
      objectIdSchema.parse(id);
      const body = await req.json();
      const input = cfg.updateSchema.parse(body);

      const existing = await cfg.model.findById(id);
      if (!existing) throw new ApiError(404, `${cfg.resourceName} not found`);
      const extra = (await cfg.beforeUpdate?.(input, existing, actor)) ?? {};

      const doc = await cfg.model.findByIdAndUpdate(id, { ...input, ...extra }, { new: true, runValidators: true });
      if (!doc) throw new ApiError(404, `${cfg.resourceName} not found`);

      await writeAudit({
        user: actor,
        action: "update",
        resource: cfg.resourceName,
        resourceId: id,
        meta: { fields: Object.keys(input as object) },
        ip: getClientIp(req.headers),
      });
      return ok(doc);
    });
  }

  async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return handleApi(async () => {
      const actor = await requireRole(...cfg.writeRoles);
      await connectDB();
      const { id } = await params;
      objectIdSchema.parse(id);

      const doc = await cfg.model.findByIdAndDelete(id);
      if (!doc) throw new ApiError(404, `${cfg.resourceName} not found`);

      await writeAudit({
        user: actor,
        action: "delete",
        resource: cfg.resourceName,
        resourceId: id,
        ip: getClientIp(req.headers),
      });
      return noContent();
    });
  }

  return { GET, PATCH, DELETE };
}
