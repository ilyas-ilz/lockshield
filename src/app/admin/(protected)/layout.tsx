import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { LeadsLiveSync } from "@/components/admin/leads-live-sync";
import type { NewLeadPreview } from "@/components/admin/admin-topbar";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { unseenLeadFilter } from "@/lib/leads-seen";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Edge middleware handles the redirect for missing cookies,
  // but this is the server-side guarantee that session exists.
  if (!session?.user) redirect("/admin/login");

  let newLeadsCount = 0;
  let newLeads: NewLeadPreview[] = [];
  try {
    await connectDB();
    // Badges count leads the user hasn't seen (see lib/leads-seen.ts); the
    // bell list still previews the newest leads awaiting a reply.
    const [me, latest] = await Promise.all([
      User.findById(session.user.id).select("leadsSeenAt").lean(),
      Lead.find({ status: "new" }).sort({ createdAt: -1 }).limit(5).select("name source createdAt").lean(),
    ]);
    newLeadsCount = await Lead.countDocuments(unseenLeadFilter(me?.leadsSeenAt));
    // Plain strings only: this crosses into the client shell.
    newLeads = latest.map((lead) => ({
      _id: String(lead._id),
      name: lead.name,
      source: lead.source,
      createdAt: new Date(lead.createdAt).toISOString(),
    }));
  } catch {
    // If DB is temporarily unreachable, fall back to an empty bell
  }

  return (
    <AdminShell
      user={session.user}
      newLeadsCount={newLeadsCount}
      newLeads={newLeads}
      signOutAction={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <LeadsLiveSync />
      {children}
    </AdminShell>
  );
}

