import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, created, ApiError } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { paginate, resolveSort } from "@/lib/pagination";
import { listQuerySchema } from "@/lib/validation/common";
import { leadCreateSchema } from "@/lib/validation/lead";
import { Lead, LEAD_SOURCES, LEAD_STATUSES } from "@/models/Lead";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/notify";
import { z } from "zod";

// WHY POST is public (no requireRole call): this is the contact/AMC/career
// form submit endpoint — real site visitors, not staff, call it. Protected
// instead by: rate limiting per IP, a honeypot field, and strict Zod
// validation (leadCreateSchema never accepts status/ip/userAgent from the body).
export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`lead:${ip}`, RATE_LIMITS.leadSubmit.max, RATE_LIMITS.leadSubmit.windowMs);
    if (!rl.allowed) throw new ApiError(429, "Too many submissions — please try again later");

    await connectDB();
    const input = leadCreateSchema.parse(await req.json());

    if (input.honeypot) {
      // WHY 201 not 4xx: telling a bot its submission was rejected teaches
      // it to adapt. Pretend success, drop silently.
      return created({ message: "Thank you — we'll be in touch." });
    }

    // WHY delete over destructure-and-drop: `honeypot` isn't a field on the
    // Lead schema at all (Mongoose ignores unknown keys in strict mode by
    // default), but stripping it explicitly here keeps that assumption from
    // being load-bearing — this route works even if strict mode is ever
    // turned off.
    const data: Record<string, unknown> = { ...input };
    delete data.honeypot;
    const lead = await Lead.create({ ...data, ip, userAgent: req.headers.get("user-agent") ?? undefined });

    void notifyNewLead(lead); // fire-and-forget — never delay/fail the visitor's response on email

    return created({ message: "Thank you — we'll be in touch." });
  });
}

// WHY parsed separately rather than `.extend()`-ed onto the list query:
// listQuerySchema ends in a .transform() (to normalise pageSize/search
// aliases), which makes it a ZodEffects — and ZodEffects has no .extend().
const leadFilterSchema = z.object({
  source: z.enum(LEAD_SOURCES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
});

const LEAD_SORTABLE = ["createdAt", "name", "status", "source"] as const;

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    await requireRole(...STAFF);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams);
    const query = listQuerySchema.parse(params);
    const filters = leadFilterSchema.parse(params);

    const filter: Record<string, unknown> = {};
    if (filters.source) filter.source = filters.source;
    if (filters.status) filter.status = filters.status;
    if (query.search) {
      const escaped = query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (char) => "\\" + char);
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: regex }, { email: regex }, { message: regex }];
    }

    const sort = resolveSort(query.sort, query.order, LEAD_SORTABLE, { createdAt: -1 });
    const result = await paginate(Lead, filter, { page: query.page, pageSize: query.pageSize, sort });
    return ok(result);
  });
}
