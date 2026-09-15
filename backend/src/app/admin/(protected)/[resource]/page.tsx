"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { getResourceConfig } from "@/lib/admin/resource-configs";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, TableSkeleton } from "@/components/shared/states";
import { FileQuestion } from "lucide-react";

export default function ResourceListPage() {
  const { resource } = useParams<{ resource: string }>();
  const config = getResourceConfig(resource);

  if (!config) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Unknown section"
        description={`There's no "${resource}" section in the admin. Use the sidebar to navigate.`}
      />
    );
  }

  return (
    <>
      <PageHeader title={config.label} description={config.description} />
      {/* DataTable reads the URL via useSearchParams, so it needs a Suspense boundary. */}
      <Suspense fallback={<TableSkeleton columns={config.columns.length} />}>
        <DataTable config={config} />
      </Suspense>
    </>
  );
}
