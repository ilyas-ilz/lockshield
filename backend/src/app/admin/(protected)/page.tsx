import Link from "next/link";
import {
  FileText,
  Building2,
  Briefcase,
  Inbox,
  PenLine,
  ArrowRight,
  Database,
  type LucideIcon,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post, Project, Job, Lead } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

// WHY a Server Component (unlike the resource CRUD pages): this is a
// one-shot read at render time with no interactivity, so it queries Mongo
// directly instead of round-tripping through the API layer.
export default async function DashboardPage() {
  let stats: { label: string; value: number; href: string; icon: LucideIcon; tone?: "brand" }[] = [];
  let recentLeads: { _id: string; name: string; source: string; createdAt: Date; status: string }[] = [];
  let dbError: string | null = null;

  try {
    await connectDB();
    const [publishedPosts, draftPosts, projects, openJobs, newLeads, leads] = await Promise.all([
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Project.countDocuments({ publishStatus: "published" }),
      Job.countDocuments({ status: "published" }),
      Lead.countDocuments({ status: "new" }),
      Lead.find().sort({ createdAt: -1 }).limit(5).select("name source createdAt status").lean(),
    ]);

    stats = [
      { label: "Published posts", value: publishedPosts, href: "/admin/posts", icon: FileText },
      { label: "Drafts", value: draftPosts, href: "/admin/posts", icon: PenLine },
      { label: "Projects", value: projects, href: "/admin/projects", icon: Building2 },
      { label: "Open roles", value: openJobs, href: "/admin/jobs", icon: Briefcase },
      { label: "New leads", value: newLeads, href: "/admin/leads", icon: Inbox, tone: "brand" },
    ];
    // WHY the double cast: .lean() types _id as ObjectId, but it's
    // serialised to a string by the time it reaches the rendered output.
    recentLeads = leads as unknown as typeof recentLeads;
  } catch (err) {
    // WHY caught rather than thrown: a stopped database shouldn't render a
    // stack trace — it should say what to do about it.
    dbError = err instanceof Error ? err.message : "Unknown database error";
  }

  if (dbError) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Card>
          <CardContent>
            <EmptyState
              icon={Database}
              title="Can't reach the database"
              description={`${dbError}. Check that MongoDB is running and that MONGODB_URI in .env is correct — running "npm run doctor" will pinpoint it.`}
            />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the website is managed from here."
        actions={
          <Button variant="primary" asChild>
            <Link href="/admin/posts/new">
              <PenLine aria-hidden />
              New post
            </Link>
          </Button>
        }
      />

      {/* 2 columns on phones, 5 across on desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="h-full transition-colors hover:border-[var(--color-brand-300)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <stat.icon className="size-4 text-muted sm:size-5" aria-hidden />
                  {stat.tone === "brand" && stat.value > 0 && <Badge tone="brand">New</Badge>}
                </div>
                <p className="mt-2 text-lg font-semibold tabular-nums sm:text-2xl">{stat.value}</p>
                <p className="truncate text-xs text-muted sm:text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent enquiries</CardTitle>
          <Link href="/admin/leads" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-brand-600)] hover:underline">
            View all
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentLeads.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No enquiries yet"
                description="Contact, AMC and career form submissions will appear here once the public site is live."
              />
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recentLeads.map((lead) => (
                <li key={String(lead._id)} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted">
                      {lead.source} · {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge tone={lead.status === "new" ? "brand" : "neutral"}>{lead.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
