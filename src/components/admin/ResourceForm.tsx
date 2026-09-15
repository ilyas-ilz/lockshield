"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import type { ResourceConfig } from "@/lib/admin/field-types";
import { FieldInput } from "./fields/FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { api, ApiClientError } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

/**
 * Config-driven form used by every resource's new/edit screen.
 *
 * Fields are grouped into a main column and an SEO sidebar so the primary
 * content isn't buried under meta fields; on mobile the sidebar stacks
 * underneath. The save bar is sticky at the bottom on small screens so
 * you never have to scroll a long form back to the top to submit.
 */
export function ResourceForm({
  config,
  id,
  initialData,
}: {
  config: ResourceConfig;
  id?: string;
  initialData?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [formData, setFormData] = React.useState<Record<string, unknown>>(() => {
    const seed: Record<string, unknown> = { ...(initialData ?? {}) };
    for (const f of config.fields) {
      if (getPath(seed, f.name) === undefined && f.defaultValue !== undefined) {
        Object.assign(seed, setPath(seed, f.name, f.defaultValue));
      }
    }
    return seed;
  });
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const mainFields = config.fields.filter((f) => !f.name.startsWith("seo."));
  const seoFields = config.fields.filter((f) => f.name.startsWith("seo."));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      if (id) {
        await api.patch(`${config.apiPath}/${id}`, formData);
        toast.success("Changes saved");
      } else {
        await api.post(config.apiPath, formData);
        toast.success(`${singular(config.label)} created`);
      }
      router.push(`/admin/${config.key}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        const details = err.details as { fieldErrors?: Record<string, string[]> } | undefined;
        if (details?.fieldErrors) {
          setFieldErrors(details.fieldErrors);
          toast.error("Please fix the highlighted fields");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  function renderField(field: (typeof config.fields)[number]) {
    const fieldId = `field-${field.name.replace(/\./g, "-")}`;
    // Zod's flatten() keys errors by top-level field, so a nested path like
    // "seo.title" reports under "seo".
    const errorKey = field.name.includes(".") ? field.name.split(".")[0]! : field.name;
    return (
      <Field
        key={field.name}
        label={field.label}
        htmlFor={fieldId}
        required={field.required}
        help={field.help}
        error={fieldErrors[errorKey]?.join(", ")}
      >
        <FieldInput
          id={fieldId}
          field={field}
          value={getPath(formData, field.name)}
          onChange={(v) => setFormData((prev) => setPath(prev, field.name, v))}
        />
      </Field>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <Card className="border-app shadow-2xs">
          <CardContent className="space-y-5 p-6">{mainFields.map(renderField)}</CardContent>
        </Card>

        {seoFields.length > 0 && (
          <Card className="border-app shadow-2xs lg:sticky lg:top-20">
            <CardHeader className="px-5 py-4 bg-surface-2/40 border-b border-app">
              <CardTitle className="text-sm font-bold">Search engine listing (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <p className="text-xs text-muted leading-relaxed">
                Leave blank to fall back to the page title and the site-wide defaults in Settings.
              </p>
              {seoFields.map(renderField)}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky action bar: always reachable on a long form, on any screen */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-app bg-surface/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span className="text-xs text-muted hidden sm:inline">
            {id ? `Editing ${singular(config.label)}` : `Creating new ${singular(config.label)}`}
          </span>
          <div className="flex gap-2.5 w-full sm:w-auto justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => router.push(`/admin/${config.key}`)}>
              <ArrowLeft className="size-3.5" aria-hidden />
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} className="shadow-xs">
              {!saving && <Save className="size-3.5 mr-1" aria-hidden />}
              {saving ? "Saving…" : id ? "Save changes" : `Create ${singular(config.label).toLowerCase()}`}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}
