"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  Search,
  X,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { api, type PageResult } from "@/lib/admin/api-client";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataPagination } from "@/components/shared/data-pagination";
import { LeadsSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

export interface LeadRow {
  _id: string;
  source: "contact" | "amc" | "career";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: "new" | "contacted" | "qualified" | "closed" | "spam";
  createdAt: string;
  ip?: string;
  userAgent?: string;
}

const STATUSES = ["new", "contacted", "qualified", "closed", "spam"] as const;
const STATUS_TONES: Record<string, "brand" | "warning" | "success" | "neutral" | "danger"> = {
  new: "brand",
  contacted: "warning",
  qualified: "success",
  closed: "neutral",
  spam: "danger",
};

export function LeadsClientTable({ initialData }: { initialData?: PageResult<LeadRow> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  const [data, setData] = React.useState<PageResult<LeadRow> | null>(initialData ?? null);
  const [loading, setLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<string | null>(null);
  const [searchDraft, setSearchDraft] = React.useState(search);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [selectedLead, setSelectedLead] = React.useState<LeadRow | null>(null);

  // Sync initialData if received from SSR
  React.useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  const setParams = React.useCallback(
    (updates: Record<string, string | number | null>, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage && !("page" in updates)) next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      setData(await api.get<PageResult<LeadRow>>(`/api/leads?${params}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search]);

  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialData) return;
    }
    void load();
  }, [load, initialData]);

  React.useEffect(() => {
    if (searchDraft === search) return;
    const timer = setTimeout(() => setParams({ search: searchDraft || null }), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, search, setParams]);

  React.useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  async function updateStatus(id: string, next: string) {
    try {
      await api.patch(`/api/leads/${id}`, { status: next });
      toast.success(`Lead marked as ${next}`);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    }
  }

  function handleCopy(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    setCopiedField(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {["", ...STATUSES].map((s) => {
            const isActive = status === s || (s === "" && !status);
            return (
              <button
                key={s || "all"}
                type="button"
                onClick={() => setParams({ status: s || null })}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-surface border border-app text-foreground shadow-2xs"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                )}
              >
                {s || "All"}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted/70" aria-hidden />
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search leads by name, email…"
            className="pl-9 pr-9 text-xs rounded-xl h-9.5"
            aria-label="Search leads"
          />
          {searchDraft && (
            <button
              type="button"
              onClick={() => setSearchDraft("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:bg-surface-2 cursor-pointer"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LeadsSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={status || search ? "No matching leads found" : "No customer leads yet"}
          description={
            status || search
              ? "Try adjusting your search query or status filter."
              : "Submissions from the public website quote and contact forms will appear here."
          }
          action={
            status || search ? (
              <Button variant="secondary" size="sm" onClick={() => setParams({ status: null, search: null })}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((lead) => {
              const initials =
                lead.name
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "CL";

              return (
                <Card
                  key={lead._id}
                  className="p-4 sm:p-5 border-app shadow-2xs hover:border-[color-mix(in_srgb,var(--brand-red)_25%,var(--border))] transition-all"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface-2 border border-app text-xs font-bold text-foreground shadow-2xs">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm text-foreground">{lead.name}</p>
                          <Badge tone="neutral" className="uppercase text-[10px] font-semibold">
                            {lead.source}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Calendar className="size-3 text-muted/60" />
                            {new Date(lead.createdAt).toLocaleDateString("en-AE", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Contact details with Copy buttons */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-app/60 bg-surface-2/40 px-2 py-1">
                            <a
                              href={`mailto:${lead.email}`}
                              className="font-medium text-foreground hover:underline flex items-center gap-1"
                            >
                              <Mail className="size-3 text-muted" />
                              {lead.email}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(lead.email, "Email")}
                              className="p-1 text-muted hover:text-foreground cursor-pointer rounded"
                              aria-label="Copy email"
                            >
                              {copiedField === lead.email ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>

                          {lead.phone && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-app/60 bg-surface-2/40 px-2 py-1">
                              <a
                                href={`tel:${lead.phone}`}
                                className="font-medium text-foreground hover:underline flex items-center gap-1"
                              >
                                <Phone className="size-3 text-muted" />
                                {lead.phone}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopy(lead.phone!, "Phone")}
                                className="p-1 text-muted hover:text-foreground cursor-pointer rounded"
                                aria-label="Copy phone"
                              >
                                {copiedField === lead.phone ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Customer Message snippet */}
                        {lead.message && (
                          <div className="mt-3 rounded-xl border border-app/60 bg-surface-2/30 p-3 text-xs text-muted leading-relaxed">
                            <p className="line-clamp-2">{lead.message}</p>
                            {lead.message.length > 120 && (
                              <button
                                type="button"
                                onClick={() => setSelectedLead(lead)}
                                className="mt-1 font-semibold text-[var(--color-brand-600)] hover:underline cursor-pointer inline-flex items-center gap-1"
                              >
                                Read full message
                                <ExternalLink className="size-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status selection and badge */}
                    <div className="shrink-0 sm:w-44 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-app">
                      <Badge tone={STATUS_TONES[lead.status] ?? "neutral"} dot className="capitalize text-xs font-semibold py-0.5">
                        {lead.status}
                      </Badge>

                      <div className="w-36">
                        <Select
                          value={lead.status}
                          onValueChange={(v) => updateStatus(lead._id, v)}
                          options={STATUSES.map((s) => ({ value: s, label: s }))}
                          className="h-8.5 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <DataPagination
            page={data.page}
            pageSize={data.pageSize ?? pageSize}
            total={data.total}
            totalPages={data.totalPages}
            hasPrevPage={data.hasPrevPage}
            hasNextPage={data.hasNextPage}
            onPageChange={(p) => setParams({ page: p }, { resetPage: false })}
            onPageSizeChange={(s) => setParams({ pageSize: s })}
          />
        </>
      )}

      {/* Full Message Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg border-app shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-app p-4 px-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-[var(--color-brand-500)]" />
                <h3 className="font-bold text-sm text-foreground">Enquiry from {selectedLead.name}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="size-8">
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex flex-wrap gap-3 pb-3 border-b border-app text-muted">
                <span><strong>Source:</strong> {selectedLead.source}</span>
                <span><strong>Email:</strong> {selectedLead.email}</span>
                {selectedLead.phone && <span><strong>Phone:</strong> {selectedLead.phone}</span>}
              </div>

              <div>
                <p className="font-bold text-foreground mb-1.5">Message:</p>
                <div className="rounded-xl border border-app bg-surface-2/40 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedLead(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" asChild>
                  <a href={`mailto:${selectedLead.email}`}>
                    <Mail className="size-3.5 mr-1" />
                    Reply by Email
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
