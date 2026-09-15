import Link from "next/link";
import {
  FileText,
  Building2,
  Inbox,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Clock,
  Mail,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post, Project, Lead, Service } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/states";

export default async function DashboardPage() {
  let stats: {
    label: string;
    value: number;
    href: string;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    subtext: string;
    isAlert?: boolean;
  }[] = [];

  let recentLeads: {
    _id: string;
    name: string;
    source: string;
    createdAt: Date;
    status: string;
    email?: string;
    phone?: string;
    message?: string;
  }[] = [];

  let newLeadsTotal = 0;
  let dbError: string | null = null;

  try {
    await connectDB();
    const [
      publishedPosts,
      draftPosts,
      projects,
      servicesCount,
      newLeads,
      leads,
    ] = await Promise.all([
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Project.countDocuments({ publishStatus: "published" }),
      Service.countDocuments({ status: "published" }),
      Lead.countDocuments({ status: "new" }),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email phone message source createdAt status")
        .lean(),
    ]);

    newLeadsTotal = newLeads;

    // 4 Compact Metric Cards — Exactly as specified
    stats = [
      {
        label: "New Leads",
        value: newLeads,
        href: "/admin/leads",
        icon: Inbox,
        iconColor: newLeads > 0 ? "text-[var(--color-brand-500)]" : "text-muted",
        iconBg: newLeads > 0 ? "bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)]/20" : "bg-surface-2 border-app",
        subtext: newLeads > 0 ? `${newLeads} awaiting response` : "All caught up",
        isAlert: newLeads > 0,
      },
      {
        label: "Live Posts",
        value: publishedPosts,
        href: "/admin/posts",
        icon: FileText,
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-500/10 border-blue-500/20",
        subtext: `${draftPosts} draft${draftPosts === 1 ? "" : "s"} in progress`,
      },
      {
        label: "Services",
        value: servicesCount,
        href: "/admin/services",
        icon: Layers,
        iconColor: "text-indigo-600 dark:text-indigo-400",
        iconBg: "bg-indigo-500/10 border-indigo-500/20",
        subtext: "Active offerings",
      },
      {
        label: "Projects",
        value: projects,
        href: "/admin/projects",
        icon: Building2,
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        subtext: "Showcase portfolio",
      },
    ];

    recentLeads = leads as unknown as typeof recentLeads;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Unknown database error";
  }

  if (dbError) {
    return (
      <Card className="border-app">
        <CardContent className="py-12">
          <EmptyState
            icon={Database}
            title="Can't reach the database"
            description={`${dbError}. Check that MongoDB is running and that MONGODB_URI in .env is correct.`}
          />
        </CardContent>
      </Card>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-AE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* 1. Header Area: Clean, Uncluttered */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            {currentDate} · Manage website content, portfolio, and customer enquiries.
          </p>
        </div>

        <Button variant="secondary" size="sm" asChild className="shadow-2xs shrink-0 self-start sm:self-auto">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
            View Site
            <ExternalLink className="size-3.5 ml-1 text-muted" />
          </Link>
        </Button>
      </div>

      {/* 2. Compact Notification Banner (Attracts attention without dominating) */}
      {newLeadsTotal > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-500)]/5 text-foreground">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-500)] opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[var(--color-brand-500)]" />
            </span>
            <p className="text-xs sm:text-sm font-semibold truncate text-foreground">
              <span className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] font-bold">{newLeadsTotal}</span> new customer {newLeadsTotal === 1 ? "enquiry needs" : "enquiries need"} your response
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:underline"
          >
            View Enquiry
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Four Compact Metric Cards (No large empty areas, no noisy status pills) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card
              hover
              className={`border-app bg-surface p-4 transition-all ${
                stat.isAlert ? "ring-1 ring-[var(--color-brand-500)]/30" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted truncate">
                  {stat.label}
                </span>
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg border ${stat.iconBg} ${stat.iconColor} transition-transform group-hover:scale-105`}
                >
                  <stat.icon className="size-3.5" aria-hidden />
                </div>
              </div>

              <div className="mt-2">
                <p className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted truncate mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* 4. Main Section: 2 Columns (Recent Enquiries + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Recent Customer Enquiries (Main Activity Panel) */}
        <div className="lg:col-span-8">
          <Card className="border-app overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-5 py-3.5 border-b border-app">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold">Recent Customer Enquiries</CardTitle>
                {newLeadsTotal > 0 && (
                  <Badge tone="brand" className="text-[10px] font-bold py-0">
                    {newLeadsTotal} New
                  </Badge>
                )}
              </div>
              <Link
                href="/admin/leads"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:underline"
              >
                View all
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
                <ul className="divide-y divide-line">
                  {recentLeads.map((lead) => {
                    const isNew = lead.status === "new";
                    return (
                      <li key={String(lead._id)}>
                        <Link
                          href="/admin/leads"
                          className="group flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-surface-2/60 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Status Indicator Dot */}
                            <div className="pt-1.5 shrink-0">
                              {isNew ? (
                                <span className="size-2 rounded-full bg-[var(--color-brand-500)] inline-block ring-2 ring-[var(--color-brand-500)]/20" />
                              ) : (
                                <span className="size-2 rounded-full bg-[var(--text-muted)]/40 inline-block" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors truncate">
                                  {lead.name}
                                </span>
                                <Badge tone="neutral" className="text-[9px] font-semibold uppercase px-1.5 py-0">
                                  {lead.source}
                                </Badge>
                                {isNew && (
                                  <Badge tone="brand" className="text-[9px] font-bold px-1.5 py-0">
                                    NEW
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[11px] text-muted">
                                {lead.email && (
                                  <span className="truncate flex items-center gap-1">
                                    <Mail className="size-2.5 text-muted/70" />
                                    {lead.email}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="size-2.5 text-muted/70" />
                                  {new Date(lead.createdAt).toLocaleDateString("en-AE", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {lead.message && (
                                <p className="mt-1 text-xs text-muted line-clamp-1 italic">
                                  &ldquo;{lead.message}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] group-hover:underline">
                              View
                              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions (Directly alongside Recent Activity) */}
        <div className="lg:col-span-4">
          <Card className="border-app overflow-hidden">
            <CardHeader className="px-4 sm:px-5 py-3.5 border-b border-app">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5">
              <Link
                href="/admin/posts/new"
                className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-app hover:bg-surface-2/70 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <Plus className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors">
                      Write Blog Post
                    </p>
                    <p className="text-[11px] text-muted truncate">Draft fire safety article</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>

              <Link
                href="/admin/projects/new"
                className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-app hover:bg-surface-2/70 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Plus className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors">
                      Add Project
                    </p>
                    <p className="text-[11px] text-muted truncate">Showcase completed job</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>

              <Link
                href="/admin/services/new"
                className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-app hover:bg-surface-2/70 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <Plus className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors">
                      Add Service
                    </p>
                    <p className="text-[11px] text-muted truncate">Create service offering</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>

              <Link
                href="/admin/leads"
                className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-app hover:bg-surface-2/70 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7.5 rounded-lg bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] flex items-center justify-center border border-[var(--color-brand-500)]/20 shrink-0">
                    <Inbox className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)] transition-colors">
                      View Leads
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {newLeadsTotal > 0 ? `${newLeadsTotal} awaiting response` : "Review customer enquiries"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
