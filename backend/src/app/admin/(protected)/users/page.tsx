"use client";

import { Suspense } from "react";
import { DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/states";
import type { ResourceConfig } from "@/lib/admin/field-types";

// WHY a local config rather than an entry in RESOURCE_CONFIGS: DataTable
// handles listing and deleting generically, but user creation hashes a
// password and assignment of roles is the most sensitive write in the
// system — those get their own explicit pages (users/new, users/[id]).
const usersConfig: ResourceConfig = {
  key: "users",
  label: "Users",
  apiPath: "/api/users",
  searchable: false,
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "active", label: "Active", render: (r) => (r.active ? "Yes" : "No") },
  ],
  fields: [],
};

export default function UsersListPage() {
  return (
    <>
      <PageHeader title="Users" description="Who can sign in to this admin, and what they're allowed to change." />
      <Suspense fallback={<TableSkeleton columns={4} />}>
        <DataTable config={usersConfig} />
      </Suspense>
    </>
  );
}
