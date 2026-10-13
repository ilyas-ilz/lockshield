import { Suspense } from "react";
import { CheckCircle2, Inbox, MessageCircle, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { LeadsSkeleton } from "@/components/shared/states";
import { fetchLeadsSSR, type QueryParams } from "@/lib/admin/server-data";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import type { LeadStatus } from "@/lib/constants";
import { LeadsClientTable, type LeadRow } from "./leads-client";
import { auth } from "@/lib/auth";
import { LeadsSeenMarker } from "./leads-seen-marker";

interface LeadsPageProps {
  searchParams: Promise<QueryParams>;
}

async function leadCounts(): Promise<{ total: number } & Partial<Record<LeadStatus, number>>> {
  try {
    await connectDB();
    const rows = await Lead.aggregate<{ _id: LeadStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const counts: { total: number } & Partial<Record<LeadStatus, number>> = { total: 0 };
    for (const r of rows) {
      counts[r._id] = r.count;
      counts.total += r.count;
    }
    return counts;
  } catch {
    return { total: 0 };
  }
}

/**
 * ISO time of the newest lead if this user hasn't seen it yet, else null.
 * Drives LeadsSeenMarker, which clears the bell and sidebar badge.
 */
async function unseenUntil(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  try {
    await connectDB();
    const [latest, user] = await Promise.all([
      Lead.findOne({}).sort({ createdAt: -1 }).select("createdAt").lean(),
      User.findById(userId).select("leadsSeenAt").lean(),
    ]);
    if (!latest) return null;
    const latestAt = new Date(latest.createdAt);
    return user?.leadsSeenAt && latestAt <= new Date(user.leadsSeenAt) ? null : latestAt.toISOString();
  } catch {
    return null;
  }
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const sp = await searchParams;
  const [initialData, counts, session] = await Promise.all([fetchLeadsSSR<LeadRow>(sp), leadCounts(), auth()]);
  const waiting = counts.new ?? 0;
  const markUntil = await unseenUntil(session?.user?.id);

  return (
    <>
      {markUntil && <LeadsSeenMarker until={markUntil} />}
      <PageHeader
        title="Customer Leads"
        description="Submissions captured from website contact, AMC quote, and career application forms."
        icon={Inbox}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="All leads" value={counts.total} icon={Inbox} href="/admin/leads" />
        <StatCard
          label="Awaiting reply"
          value={waiting}
          icon={Sparkles}
          href="/admin/leads?status=new"
          highlight={waiting > 0}
        />
        <StatCard label="Contacted" value={counts.contacted ?? 0} icon={MessageCircle} href="/admin/leads?status=contacted" />
        <StatCard label="Closed" value={counts.closed ?? 0} icon={CheckCircle2} href="/admin/leads?status=closed" />
      </div>
      <Suspense fallback={<LeadsSkeleton />}>
        <LeadsClientTable initialData={initialData ?? undefined} canDelete={session?.user?.role === "ADMIN"} />
      </Suspense>
    </>
  );
}
