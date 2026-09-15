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
    { key: "active", label: "Active", render: (r) => (r.active ? "Yes" : "No") },
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
