import { Building2, Database, ExternalLink, FileText, Inbox, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import { StatCard } from "@/components/shared/stat-card";
import { getDashboardData, type DashboardData } from "./_components/dashboard-data";
import { ActivityPanel, PipelinePanel, RecentLeadsPanel } from "./_components/lead-panels";
import { QuickActionsPanel } from "./_components/content-panels";

export default async function DashboardPage() {
  const now = new Date();
  let data: DashboardData;
  try {
    data = await getDashboardData(now);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown database error";
    return (
      <Card className="border-app">
        <CardContent className="py-12">
          <EmptyState
            icon={Database}
            title="Can't reach the database"
            description={`${message}. Check that MongoDB is running and that MONGODB_URI in .env is correct.`}
          />
        </CardContent>
      </Card>
    );
  }

  const { leads, content } = data;
  const waiting = leads.byStatus.new;
  const today = now.toLocaleDateString("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dubai",
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3 sm:items-end sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-app sm:text-3xl">Dashboard</h1>
          <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
            {today}
            <span className="hidden sm:inline"> · Website content, portfolio and customer enquiries.</span>
          </p>
        </div>
        <Button
          variant="secondary"
          asChild
          className="size-11 shrink-0 p-0 sm:h-10 sm:w-auto sm:px-4"
        >
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="View site">
            <span className="hidden sm:inline">View site</span>
            <ExternalLink aria-hidden />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="New leads"
          value={waiting}
          icon={Inbox}
          href={waiting > 0 ? "/admin/leads?status=new" : "/admin/leads"}
          hint={waiting > 0 ? `Awaiting your reply · ${leads.thisMonth} this month` : `${leads.thisMonth} received this month`}
          highlight={waiting > 0}
        />
        <StatCard
          label="Live posts"
          value={content.publishedPosts}
          icon={FileText}
          href="/admin/posts"
          hint={`${content.draftPosts} draft${content.draftPosts === 1 ? "" : "s"} in progress`}
        />
        <StatCard label="Services" value={content.services} icon={Layers} href="/admin/services" hint="Published offerings" />
        <StatCard label="Projects" value={content.projects} icon={Building2} href="/admin/projects" hint="Showcase portfolio" />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3 xl:gap-6">
        <RecentLeadsPanel leads={leads} now={now} className="xl:col-span-2" />
        <QuickActionsPanel content={content} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-6">
        <ActivityPanel leads={leads} className="xl:col-span-2" />
        <PipelinePanel leads={leads} />
      </div>
    </div>
  );
}
