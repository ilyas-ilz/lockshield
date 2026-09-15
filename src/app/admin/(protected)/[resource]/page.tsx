import { Suspense } from "react";
import { getResourceConfig } from "@/lib/admin/resource-configs";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, TableSkeleton } from "@/components/shared/states";
import { FileQuestion } from "lucide-react";
import { fetchResourceSSR } from "@/lib/admin/server-data";

interface ResourcePageProps {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    status?: string;
  }>;
}

export default async function ResourceListPage({ params, searchParams }: ResourcePageProps) {
  const { resource } = await params;
  const sp = await searchParams;
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

  const initialData = await fetchResourceSSR(resource, sp);

  return (
    <>
      <PageHeader title={config.label} description={config.description} />
      <Suspense fallback={<TableSkeleton columns={config.columns.length} />}>
        <DataTable config={config} initialData={initialData ?? undefined} />
      </Suspense>
    </>
  );
}

