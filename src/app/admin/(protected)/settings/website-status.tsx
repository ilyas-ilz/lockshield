"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ImageIcon,
  Mail,
  RefreshCw,
  Globe,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/admin/api-client";
import type { CheckStatus, HealthCheck, HealthReport } from "@/lib/health";
import { formatRelative } from "@/lib/format-relative";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

type StatusReport = Omit<HealthReport, "technical"> & {
  technical: HealthReport["technical"] & {
    database: HealthReport["technical"]["database"] & { provider: string; name: string | null };
    storage: HealthReport["technical"]["storage"] & { provider: string; bucket: string | null };
    runtime: { nodeVersion: string; environment: string; deployment: string };
  };
};

const STATUS_STYLE: Record<CheckStatus, { label: string; icon: LucideIcon; tone: string }> = {
  ok: { label: "Working", icon: CheckCircle2, tone: "text-[var(--success)] bg-[var(--success-bg)]" },
  warning: { label: "Needs attention", icon: AlertTriangle, tone: "text-[var(--warning)] bg-[var(--warning-bg)]" },
  error: { label: "Not working", icon: XCircle, tone: "text-[var(--danger)] bg-[var(--danger-bg)]" },
};

const SUMMARY: Record<CheckStatus, { title: string; body: string }> = {
  ok: { title: "Everything is working", body: "No action needed." },
  warning: {
    title: "Your website is up, but something needs attention",
    body: "Read the amber item below and send a screenshot of this page to your website developer.",
  },
  error: {
    title: "Something isn't working",
    body: "Send a screenshot of this page to your website developer as soon as possible.",
  },
};

const CHECKS: { key: keyof HealthReport["checks"]; title: string; icon: LucideIcon }[] = [
  { key: "data", title: "Website & data", icon: Globe },
  { key: "media", title: "Pictures & uploads", icon: ImageIcon },
  { key: "email", title: "Enquiry emails", icon: Mail },
];

export function WebsiteStatus() {
  const [report, setReport] = useState<StatusReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  // Re-render every 30s so "Last checked" stays truthful while the tab is open.
  const [, setTick] = useState(0);

  const check = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      setReport(await api.get<StatusReport>("/api/admin/health"));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't run the status check.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [check]);

  return (
    <Card className="border-app shadow-xs">
      <CardHeader className="flex flex-col gap-3 border-b border-app bg-surface-2/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg border border-app bg-surface p-2 text-foreground">
            <Activity className="size-4 text-[var(--brand-red,#e01b24)]" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Website Status</CardTitle>
            <p className="mt-0.5 text-xs text-muted">
              A quick check that your website, pictures and enquiry emails are working.
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => void check()} loading={checking} className="min-h-11 sm:min-h-0">
          {!checking && <RefreshCw className="size-4" aria-hidden />}
          {checking ? "Checking…" : "Check again"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {error ? (
          <ErrorState message={error} onRetry={() => void check()} />
        ) : !report ? (
          <StatusSkeleton />
        ) : (
          <>
            <Summary status={report.overall} checkedAt={report.checkedAt} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {CHECKS.map((c) => (
                <CheckCard key={c.key} title={c.title} icon={c.icon} check={report.checks[c.key]} />
              ))}
            </div>
            <TechnicalDetails report={report} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const { label, icon: Icon, tone } = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tone)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

function Summary({ status, checkedAt }: { status: CheckStatus; checkedAt: string }) {
  const { icon: Icon, tone } = STATUS_STYLE[status];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl p-4", tone)} role="status">
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{SUMMARY[status].title}</p>
        <p className="mt-0.5 text-xs text-foreground/80">
          {SUMMARY[status].body} Last checked {formatRelative(checkedAt)}.
        </p>
      </div>
    </div>
  );
}

function CheckCard({ title, icon: Icon, check }: { title: string; icon: LucideIcon; check: HealthCheck }) {
  return (
    <div className="flex h-full flex-col gap-2.5 rounded-xl border border-app bg-surface-2/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="truncate">{title}</span>
        </div>
        <StatusBadge status={check.status} />
      </div>
      <p className="text-sm text-muted">{check.message}</p>
    </div>
  );
}

function TechnicalDetails({ report }: { report: StatusReport }) {
  const { database, storage, email, runtime } = report.technical;
  const rows: [string, string][] = [
    ["Database", `${database.provider}${database.name ? ` / ${database.name}` : ""}`],
    ["Database ping", database.pingMs === null ? "failed" : `${database.pingMs} ms`],
    ["Storage", `${storage.provider}${storage.bucket ? ` / ${storage.bucket}` : ""}`],
    ["SMTP", email.configured ? "configured" : "not configured"],
    ["Alert recipients", email.recipients.join(", ") || "none"],
    ["Environment", `${runtime.environment} (${runtime.deployment})`],
    ["Node", runtime.nodeVersion],
    ["Checked at", new Date(report.checkedAt).toLocaleString("en-AE")],
  ];
  for (const [label, err] of [
    ["Database error", database.error],
    ["Storage error", storage.error],
    ["SMTP error", email.error],
  ] as const) {
    if (err) rows.push([label, err]);
  }

  return (
    <details className="group rounded-xl border border-app">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-4 text-xs font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-red,#e01b24)]">
        <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
        Technical details (for your developer)
      </summary>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 border-t border-app px-4 py-3 text-xs sm:grid-cols-[max-content_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="mb-1.5 break-words font-mono text-foreground sm:mb-0">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function StatusSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CHECKS.map((c) => (
          <Skeleton key={c.key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
