import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/states";
import { fetchResourceSSR, type QueryParams } from "@/lib/admin/server-data";
import type { ResourceConfig } from "@/lib/admin/field-types";

const usersConfig: ResourceConfig = {
  key: "users",
  label: "Users",
  apiPath: "/api/users",
  searchable: true,
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    // No `render` here on purpose: this config is built in a Server Component
    // and handed to <DataTable>, a Client Component - a function prop cannot
    // cross that boundary and crashed the whole page. DataTable's renderCell
    // already formats booleans as a Yes badge / No label.
    { key: "active", label: "Active" },
  ],
  fields: [],
};

interface UsersPageProps {
  searchParams: Promise<QueryParams>;
}

export default async function UsersListPage({ searchParams }: UsersPageProps) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const sp = await searchParams;
  const initialData = await fetchResourceSSR("users", sp);

  return (
    <>
      <PageHeader
        title="Admin Users"
        description="Who can sign in to this portal, and what permissions they have."
      />
      <Suspense fallback={<TableSkeleton columns={4} />}>
        <DataTable config={usersConfig} initialData={initialData ?? undefined} />
      </Suspense>
    </>
  );
}
