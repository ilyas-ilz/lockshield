import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, FlaskConical, Inbox, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Panel, PanelLink } from "@/components/shared/panel";
import { initialsOf } from "@/lib/initials";
import { formatRelative } from "@/lib/format-relative";
import type { LeadStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DashboardData } from "./dashboard-data";

type Leads = DashboardData["leads"];

export const LEAD_STATUS_BADGE: Record<LeadStatus, { tone: "warning" | "info" | "success" | "neutral" | "danger"; label: string }> = {
  new: { tone: "warning", label: "New" },
  contacted: { tone: "info", label: "Contacted" },
  qualified: { tone: "success", label: "Qualified" },
  closed: { tone: "neutral", label: "Closed" },
  spam: { tone: "danger", label: "Spam" },
};

const SOURCE_LABEL: Record<string, string> = { contact: "Contact form", amc: "AMC quote", career: "Job application" };

function Donut({ value, total, label }: { value: number; total: number; label: string }) {
  const r = 62;
  const c = 2 * Math.PI * r;
  const share = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <div className="relative mx-auto size-40 shrink-0">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="14" />
        {share > 0 && (
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="var(--color-brand-500)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${c * share} ${c}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-app tabular-nums">{value}</span>
        <span className="mt-0.5 text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}

export function PipelinePanel({ leads }: { leads: Leads }) {
  const waiting = leads.byStatus.new;
  // "New" is the donut's centre figure; listing it again was a duplicate.
  const rows: { status: LeadStatus; dot: string }[] = [
    { status: "contacted", dot: "bg-blue-500" },
    { status: "qualified", dot: "bg-emerald-500" },
    { status: "closed", dot: "bg-slate-400" },
  ];
  return (
    <Panel
      title="Lead pipeline"
      subtitle={`${leads.total} ${leads.total === 1 ? "enquiry" : "enquiries"} received in total`}
      icon={Clock}
      actions={<PanelLink href="/admin/leads">Review</PanelLink>}
    >
      <Donut value={waiting} total={leads.total} label="awaiting reply" />
      <ul className="mt-6 space-y-2.5">
        {rows.map(({ status, dot }) => (
          <li key={status} className="flex items-center gap-3 text-sm">
            <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden />
            <span className="flex-1 text-muted">{LEAD_STATUS_BADGE[status].label}</span>
            <span className="font-semibold text-app tabular-nums">{leads.byStatus[status]}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ActivityPanel({ leads, className }: { leads: Leads; className?: string }) {
  const max = Math.max(1, ...leads.week.map((d) => d.count));
  const weekTotal = leads.week.reduce((sum, d) => sum + d.count, 0);
  return (
    <Panel
      title="Enquiry activity"
      subtitle={`${weekTotal} new ${weekTotal === 1 ? "enquiry" : "enquiries"} over the last 7 days`}
      icon={CalendarDays}
      actions={<PanelLink href="/admin/leads">See all</PanelLink>}
      className={className}
    >
      <ul className="grid h-full grid-cols-7 gap-2 sm:gap-4">
        {leads.week.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-2">
            <span className="sr-only">
              {d.weekday} {d.day}: {d.count} {d.count === 1 ? "enquiry" : "enquiries"}
              {d.isToday ? " (today)" : ""}
            </span>
            <span className={cn("text-xs sm:text-sm", d.isToday ? "font-semibold text-app" : "text-muted")} aria-hidden>
              {d.weekday}
            </span>
            <div className="flex h-40 w-full flex-col items-center justify-end gap-1.5" aria-hidden>
              <span className={cn("text-xs tabular-nums", d.count > 0 ? "font-semibold text-app" : "text-muted")}>{d.count}</span>
              <div
                className={cn(
                  "w-full max-w-14 rounded-md",
                  d.isToday ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-500)]/25"
                )}
                style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }}
              />
            </div>
            <span className={cn("text-sm tabular-nums", d.isToday ? "font-semibold text-app" : "text-muted")} aria-hidden>
              {d.day}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function RecentLeadsPanel({ leads, now, className }: { leads: Leads; now: Date; className?: string }) {
  return (
    <Panel
      title="Recent enquiries"
      subtitle="Latest customers and where they stand"
      icon={ListChecks}
      actions={<PanelLink href="/admin/leads">View all</PanelLink>}
      bodyClassName="p-0 sm:p-0"
      className={className}
    >
      {leads.recent.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <Inbox className="size-5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-app">No enquiries yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            When visitors submit the contact or quote form, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {leads.recent.map((lead) => {
            const badge = LEAD_STATUS_BADGE[lead.status] ?? LEAD_STATUS_BADGE.new;
            return (
              <li key={lead.id}>
                <Link
                  href={`/admin/leads?search=${encodeURIComponent(lead.name)}`}
                  className={cn(
                    "group flex items-start gap-3.5 px-4 py-4 transition-colors hover:bg-surface-2/60 sm:px-6",
                    lead.isTest && "opacity-70"
                  )}
                >
                  <span
                    className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-app"
                    aria-hidden
                  >
                    {initialsOf(lead.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold text-app group-hover:text-[var(--color-brand-600)] dark:group-hover:text-[var(--color-brand-400)]">
                        {lead.name}
                      </p>
                      {lead.isTest ? (
                        <Badge tone="neutral" className="shrink-0 gap-1 shadow-none">
                          <FlaskConical className="size-3" aria-hidden />
                          Test
                        </Badge>
                      ) : (
                        <Badge tone={badge.tone} className="shrink-0 shadow-none">
                          {badge.label}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-muted">
                      {[lead.email, SOURCE_LABEL[lead.source] ?? lead.source, formatRelative(lead.createdAt, now)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {lead.message && <p className="mt-1 line-clamp-1 text-[13px] text-foreground/75">{lead.message}</p>}
                  </div>
                  <span className="mt-2.5 hidden shrink-0 items-center gap-1 text-sm font-medium text-muted transition-colors group-hover:text-[var(--color-brand-600)] sm:inline-flex dark:group-hover:text-[var(--color-brand-400)]">
                    View
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
