"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileQuestion } from "lucide-react";
import { getResourceConfig } from "@/lib/admin/resource-configs";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Card, CardContent, Skeleton } from "@/components/ui/card";
import { api } from "@/lib/admin/api-client";

export default function EditResourcePage() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
  const config = getResourceConfig(resource);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!config) return;
    setError(null);
    try {
      setData(await api.get<Record<string, unknown>>(`${config.apiPath}/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [config, id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!config) {
    return <EmptyState icon={FileQuestion} title="Unknown section" description={`There's no "${resource}" section.`} />;
  }

  return (
    <>
      <PageHeader title={`Edit ${singular(config.label).toLowerCase()}`} />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data ? (
        <Card>
          <CardContent className="space-y-4">
            {/* Skeleton shaped like the form it replaces, not a spinner */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <ResourceForm config={config} id={id} initialData={data} />
      )}
    </>
  );
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}
