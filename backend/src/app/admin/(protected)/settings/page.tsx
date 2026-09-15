"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { FieldInput } from "@/components/admin/fields/FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { api, ApiClientError } from "@/lib/admin/api-client";
import type { FieldConfig } from "@/lib/admin/field-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";

// WHY a bespoke page, not RESOURCE_CONFIGS + DataTable: Settings is a
// singleton (no list, no create, no delete) — only "fetch the one doc,
// edit, save". Grouped into sections because a 20-field flat form is
// unreadable.
const SECTIONS: { title: string; description?: string; fields: FieldConfig[] }[] = [
  {
    title: "Business identity",
    fields: [
      { name: "siteName", label: "Site name", type: "text", required: true },
      { name: "legalName", label: "Legal (registered) name", type: "text", required: true },
      { name: "logoUrl", label: "Logo", type: "image" },
    ],
  },
  {
    title: "Contact details",
    description: "Used in the header, footer, contact page, and the LocalBusiness structured data Google reads.",
    fields: [
      { name: "phones", label: "Phone numbers", type: "stringArray" },
      { name: "whatsapp", label: "WhatsApp number", type: "text" },
      { name: "emails", label: "Email addresses", type: "stringArray" },
      { name: "address.poBox", label: "PO Box", type: "text" },
      { name: "address.street", label: "Street", type: "text" },
      { name: "address.locality", label: "City", type: "text" },
      { name: "address.country", label: "Country code", type: "text", help: "Two letters, e.g. AE" },
    ],
  },
  {
    title: "Partner backlinks",
    description:
      "Real links to lockshieldcart.com, shown in the footer and included in your Organization schema. Vary the wording between entries — identical anchor text repeated everywhere reads as manipulation to search engines.",
    fields: [
      {
        name: "partnerLinks",
        label: "Links",
        type: "objectArray",
        itemFields: [
          { name: "label", label: "Anchor text", type: "text", required: true },
          { name: "url", label: "URL", type: "text", required: true },
          { name: "rel", label: "rel attribute", type: "text", defaultValue: "noopener" },
        ],
      },
    ],
  },
  {
    title: "Social profiles",
    fields: [
      {
        name: "socials",
        label: "Profiles",
        type: "objectArray",
        itemFields: [
          { name: "platform", label: "Platform", type: "text", required: true },
          { name: "url", label: "URL", type: "text", required: true },
        ],
      },
    ],
  },
  {
    title: "Default SEO",
    description: "Used on any page that doesn't set its own title or description.",
    fields: [
      { name: "defaultSeo.title", label: "Default title", type: "text" },
      { name: "defaultSeo.description", label: "Default description", type: "textarea" },
      { name: "footerNote", label: "Footer note", type: "textarea" },
    ],
  },
  {
    title: "Analytics",
    fields: [
      { name: "analytics.gaId", label: "Google Analytics ID", type: "text", help: "e.g. G-XXXXXXXXXX" },
      { name: "analytics.gtmId", label: "Google Tag Manager ID", type: "text", help: "e.g. GTM-XXXXXXX" },
    ],
  },
];

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await api.get<Record<string, unknown>>("/api/settings"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      setData(await api.patch<Record<string, unknown>>("/api/settings", data));
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Contact details, navigation and schema data used across every page. Administrators only."
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {SECTIONS.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && <p className="mt-1 text-xs text-muted">{section.description}</p>}
                </CardHeader>
                <CardContent className="space-y-5">
                  {section.fields.map((field) => {
                    const fieldId = `settings-${field.name.replace(/\./g, "-")}`;
                    return (
                      <Field key={field.name} label={field.label} htmlFor={fieldId} required={field.required} help={field.help}>
                        <FieldInput
                          id={fieldId}
                          field={field}
                          value={getPath(data, field.name)}
                          onChange={(v) => setData((prev) => setPath(prev!, field.name, v))}
                        />
                      </Field>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-0 z-10 mt-5 -mx-4 border-t border-app bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={saving} className="w-full sm:w-auto">
                {!saving && <Save aria-hidden />}
                {saving ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
}
