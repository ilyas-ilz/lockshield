"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { api, type PageResult } from "@/lib/admin/api-client";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataPagination } from "@/components/shared/data-pagination";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/shared/states";

interface LeadRow {
  _id: string;
  source: "contact" | "amc" | "career";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: "new" | "contacted" | "qualified" | "closed" | "spam";
  createdAt: string;
}

const STATUSES = ["new", "contacted", "qualified", "closed", "spam"] as const;
const STATUS_TONES: Record<string, "brand" | "warning" | "success" | "neutral" | "danger"> = {
  new: "brand",
  contacted: "warning",
  qualified: "success",
  closed: "neutral",
  spam: "danger",
};

export default function LeadsPage() {
  return (
    <>
      <PageHeader title="Leads" description="Submissions from the contact, AMC and career forms." />
      <Suspense fallback={<TableSkeleton columns={5} />}>
        <LeadsTable />
      </Suspense>
    </>
  );
}

function LeadsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const status = searchParams.get("status") ?? "";

  const [data, setData] = useState<PageResult<LeadRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setParams = useCallback(
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (status) params.set("status", status);
      setData(await api.get<PageResult<LeadRow>>(`/api/leads?${params}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, next: string) {
    try {
      await api.patch(`/api/leads/${id}`, { status: next });
      toast.success("Status updated");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter chips scroll horizontally on a phone rather than wrapping into a tall block */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {["", ...STATUSES].map((s) => (
          <Button
            key={s || "all"}
            size="sm"
            variant={status === s ? "primary" : "secondary"}
            className="shrink-0 capitalize"
            onClick={() => setParams({ status: s || null })}
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={Math.min(pageSize, 8)} columns={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={status ? `No ${status} leads` : "No leads yet"}
          description={
            status
              ? "Try a different status filter."
              : "Contact, AMC and career form submissions will land here once the public site is live."
          }
          action={
            status ? (
              <Button variant="secondary" onClick={() => setParams({ status: null })}>
                Clear filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((lead) => (
              <Card key={lead._id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{lead.name}</p>
                      <Badge tone="neutral">{lead.source}</Badge>
                      <span className="text-xs text-muted">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:gap-4">
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-app">
                        <Mail className="size-3.5" aria-hidden />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:text-app">
                          <Phone className="size-3.5" aria-hidden />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                    {lead.message && <p className="mt-2 text-sm text-muted line-clamp-3">{lead.message}</p>}
                  </div>

                  <div className="shrink-0 sm:w-40">
                    <Select
                      value={lead.status}
                      onValueChange={(v) => updateStatus(lead._id, v)}
                      options={STATUSES.map((s) => ({ value: s, label: s }))}
                    />
                    <div className="mt-1.5 flex sm:justify-end">
                      <Badge tone={STATUS_TONES[lead.status] ?? "neutral"}>{lead.status}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
    </div>
  );
}
