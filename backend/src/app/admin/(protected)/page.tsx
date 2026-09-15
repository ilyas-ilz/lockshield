import Link from "next/link";
import {
  FileText,
  Building2,
  Briefcase,
  Inbox,
  PenLine,
  ArrowRight,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Cloud,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post, Project, Job, Lead, Service } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { hasCloudinary } from "@/lib/env";

export default async function DashboardPage() {
  let stats: {
    label: string;
    value: number;
    href: string;
    icon: LucideIcon;
    color: string;
    badge?: string;
  }[] = [];
  let recentLeads: { _id: string; name: string; source: string; createdAt: Date; status: string; email?: string }[] = [];
  let publishedServices = 0;
  let dbError: string | null = null;
  const isCloudinaryActive = hasCloudinary();

  try {
    await connectDB();
    const [
      publishedPosts,
      draftPosts,
      projects,
      servicesCount,
      openJobs,
      newLeads,
      leads,
    ] = await Promise.all([
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Project.countDocuments({ publishStatus: "published" }),
      Service.countDocuments({ status: "published" }),
      Job.countDocuments({ status: "published" }),
      Lead.countDocuments({ status: "new" }),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("name email source createdAt status")
        .lean(),
    ]);

    publishedServices = servicesCount;
    stats = [
      {
        label: "Live Posts",
        value: publishedPosts,
        href: "/admin/posts",
        icon: FileText,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      },
      {
        label: "Draft Posts",
        value: draftPosts,
        href: "/admin/posts",
        icon: PenLine,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      },
      {
        label: "Services",
        value: servicesCount,
        href: "/admin/services",
        icon: Layers,
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      },
      {
        label: "Projects",
        value: projects,
        href: "/admin/projects",
        icon: Building2,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        label: "Careers",
        value: openJobs,
        href: "/admin/jobs",
        icon: Briefcase,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      },
      {
        label: "New Leads",
        value: newLeads,
        href: "/admin/leads",
        icon: Inbox,
        color: "text-red-500 bg-red-500/10 border-red-500/20",
        badge: newLeads > 0 ? `${newLeads} New` : undefined,
      },
    ];

    recentLeads = leads as unknown as typeof recentLeads;
  } catch (err) {
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
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dashboard
            <Sparkles className="size-5 text-[var(--brand-red,#e01b24)]" />
          </h1>
          <p className="text-sm text-muted">
            Manage Lock Shield website content, portfolio, and customer enquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-1.5" />
              View Live Site
            </Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/admin/posts/new">
              <PlusCircle className="size-3.5 mr-1.5" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app bg-surface-2/40 px-4 py-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Database Connected</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            {isCloudinaryActive ? (
              <>
                <Cloud className="size-3.5 text-blue-500" />
                <span>Storage: Cloudinary</span>
              </>
            ) : (
              <>
                <HardDrive className="size-3.5 text-amber-500" />
                <span>Storage: Local Disk (public/uploads)</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/services"
            className="text-muted hover:text-foreground transition-colors"
          >
            {publishedServices} active services
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/admin/settings"
            className="text-[var(--brand-red,#e01b24)] hover:underline font-medium"
          >
            Settings & NAP →
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="h-full border-app transition-all hover:border-[var(--brand-red,#e01b24)]/50 hover:shadow-sm">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg border ${stat.color}`}>
                    <stat.icon className="size-4" aria-hidden />
                  </div>
                  {stat.badge && (
                    <Badge tone="brand" className="text-[10px] font-semibold">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/projects/new"
          className="flex items-center justify-between p-3.5 rounded-xl border border-app bg-surface hover:bg-surface-2/70 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Building2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Add Project</p>
              <p className="text-[11px] text-muted">Showcase a completed client job</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/services/new"
          className="flex items-center justify-between p-3.5 rounded-xl border border-app bg-surface hover:bg-surface-2/70 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Add Service</p>
              <p className="text-[11px] text-muted">Create a fire safety service page</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/jobs/new"
          className="flex items-center justify-between p-3.5 rounded-xl border border-app bg-surface hover:bg-surface-2/70 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Briefcase className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Post Job Opening</p>
              <p className="text-[11px] text-muted">Recruit technicians & engineers</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Recent Enquiries Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
          <div>
            <CardTitle>Recent Customer Enquiries</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Leads captured via contact, AMC quote, and career submission forms.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-red,#e01b24)] hover:underline"
          >
            View all leads
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentLeads.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Inbox}
                title="No enquiries yet"
                description="When visitors submit the quote or contact form on the public site, their details will appear here."
              />
            </div>
          ) : (
            <ul className="divide-y divide-app">
              {recentLeads.map((lead) => {
                let statusTone: "neutral" | "success" | "warning" | "danger" | "brand" = "neutral";
                if (lead.status === "new") statusTone = "brand";
                else if (lead.status === "contacted") statusTone = "warning";
                else if (lead.status === "closed") statusTone = "success";
                else if (lead.status === "junk") statusTone = "danger";

                return (
                  <li
                    key={String(lead._id)}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-2/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {lead.name}
                        </p>
                        {lead.email && (
                          <span className="hidden sm:inline text-xs text-muted truncate">
                            ({lead.email})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Source: <span className="font-medium text-foreground capitalize">{lead.source}</span> ·{" "}
                        {new Date(lead.createdAt).toLocaleDateString("en-AE", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge tone={statusTone} className="capitalize">
                      {lead.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
