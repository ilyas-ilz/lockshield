import { NextRequest } from "next/server";
import { handleApi, ok } from "@/lib/http";
import { requireRole, ADMIN_ONLY, STAFF } from "@/lib/rbac";
import { settingsUpdateSchema } from "@/lib/validation/settings";
import { Settings } from "@/models/Settings";
import { getSettings } from "@/lib/settings";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// WHY a hand-written singleton route, not the CRUD factory: there is
// exactly one Settings document and no list/create/delete makes sense for
// it — GET always returns "the" settings (creating it on first call),
// PATCH always updates the same fixed _id.
export async function GET() {
  return handleApi(async () => {
    await requireRole(...STAFF); // any staff member can read (nav/logo/etc. needed to build most admin screens)
    const settings = await getSettings();
    return ok(settings);
  });
}

export async function PATCH(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireRole(...ADMIN_ONLY); // sitewide config: ADMIN only
    const input = settingsUpdateSchema.parse(await req.json());

    await getSettings(); // ensure it exists
    const updated = await Settings.findByIdAndUpdate("global", input, { new: true, runValidators: true });

    await writeAudit({
      user: actor,
      action: "update",
      resource: "Settings",
      resourceId: "global",
      meta: { fields: Object.keys(input) },
      ip: getClientIp(req.headers),
    });
    return ok(updated);
  });
}
