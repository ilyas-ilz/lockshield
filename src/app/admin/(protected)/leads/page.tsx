import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LeadsSkeleton } from "@/components/shared/states";
import { fetchLeadsSSR, type QueryParams } from "@/lib/admin/server-data";
import { LeadsClientTable, type LeadRow } from "./leads-client";

interface LeadsPageProps {
  searchParams: Promise<QueryParams>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const sp = await searchParams;
  const initialData = await fetchLeadsSSR<LeadRow>(sp);

  return (
    <>
      <PageHeader
        title="Customer Leads"
        description="Submissions captured from website contact, AMC quote, and career application forms."
      />
      <Suspense fallback={<LeadsSkeleton />}>
        <LeadsClientTable initialData={initialData ?? undefined} />
      </Suspense>
    </>
  );
}
