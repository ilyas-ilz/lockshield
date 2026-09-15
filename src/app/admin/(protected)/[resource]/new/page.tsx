"use client";

import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { getResourceConfig } from "@/lib/admin/resource-configs";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";

export default function NewResourcePage() {
  const { resource } = useParams<{ resource: string }>();
  const config = getResourceConfig(resource);

  if (!config) {
    return <EmptyState icon={FileQuestion} title="Unknown section" description={`There's no "${resource}" section.`} />;
  }

  return (
    <>
      <PageHeader title={`New ${singular(config.label).toLowerCase()}`} />
      <ResourceForm config={config} />
    </>
  );
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}
