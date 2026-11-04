"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { FieldInput } from "@/components/admin/fields/FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { api, ApiClientError, validationIssues } from "@/lib/admin/api-client";
import { changedKeys } from "@/lib/admin/changed-keys";
import { diffFields } from "@/lib/admin/field-diff";
import {
  EditLockActions,
  EditLockStatus,
  LockedFieldset,
  ReviewChangesDialog,
} from "@/components/admin/edit-lock";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS as SECTIONS, findSettingsField } from "./sections";
import { WebsiteStatus } from "./website-status";

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  // Last state the server confirmed; the save sends only what differs from it.
  const [saved, setSaved] = useState<Record<string, unknown> | null>(null);
  const [activeSection, setActiveSection] = useState<string>("identity");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Saved values open locked; "Edit" unlocks, Save asks for confirmation.
  const [editing, setEditing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  // Bumped on discard so editors with internal state (rich text) remount.
  const [resetKey, setResetKey] = useState(0);

  const changes = useMemo(() => (data && saved ? diffFields(ALL_FIELDS, saved, data) : []), [data, saved]);

  function discard() {
    setData(saved);
    setFieldErrors({});
    setEditing(false);
    setResetKey((k) => k + 1);
  }

  const load = useCallback(async () => {
    setError(null);
    try {
      const loaded = await api.get<Record<string, unknown>>("/api/settings");
      setData(loaded);
      setSaved(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !data || !saved) return;
    if (changes.length === 0 || Object.keys(changedKeys(saved, data)).length === 0) {
      toast.info("No changes to save");
      return;
    }
    setReviewOpen(true);
  }

  async function save() {
    if (!data || !saved) return;
    const payload = changedKeys(saved, data);
    setSaving(true);
    setFieldErrors({});
    try {
      const updated = await api.patch<Record<string, unknown>>("/api/settings", payload);
      setData(updated);
      setSaved(updated);
      setEditing(false);
      setResetKey((k) => k + 1);
      toast.success("Settings updated successfully");
    } catch (err) {
      // Edits on several tabs save together, so the field at fault may be on
      // another tab: open it, mark the field, and name it in the toast.
      const located = validationIssues(err).flatMap((issue) => {
        const field = findSettingsField(issue.path);
        return field ? [{ ...field, message: issue.message }] : [];
      });
      if (located.length > 0) {
        setFieldErrors(Object.fromEntries(located.map((f) => [f.fieldName, f.message])));
        setActiveSection(located[0]!.sectionId);
        toast.error(`${located[0]!.label}: ${located[0]!.message}`);
      } else {
        toast.error(err instanceof ApiClientError ? err.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0]!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Settings"
        description="Business details, contact information, partner links, search engine settings and website status."
        icon={SettingsIcon}
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-app pb-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-surface border border-app text-foreground font-semibold shadow-xs"
                      : "text-muted hover:text-foreground hover:bg-surface-2/60"
                  )}
                >
                  <Icon className={cn("size-3.5", isActive ? "text-[var(--brand-red,#e01b24)]" : "text-muted")} />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Section Card */}
          {activeSection === "system" ? (
            <WebsiteStatus />
          ) : (
            <>
              <Card className="border-app shadow-xs">
                <CardHeader className="px-6 py-4 border-b border-app bg-surface-2/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-surface border border-app text-foreground">
                      <currentSection.icon className="size-4 text-[var(--brand-red,#e01b24)]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{currentSection.title}</CardTitle>
                      {currentSection.description && (
                        <p className="mt-0.5 text-xs text-muted">{currentSection.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <LockedFieldset key={resetKey} locked={!editing} className="min-w-0">
                <CardContent className="space-y-5 p-6">
                  {currentSection.fields.map((field) => {
                    const fieldId = `settings-${field.name.replace(/\./g, "-")}`;
                    return (
                      <Field
                        key={field.name}
                        label={field.label}
                        htmlFor={fieldId}
                        required={field.required}
                        help={field.help}
                        error={fieldErrors[field.name]}
                      >
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
                </LockedFieldset>
              </Card>

              {/* Sticky Save Bar */}
              <div className="sticky bottom-(--admin-bottom-nav) z-10 -mx-4 border-t border-app bg-surface px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <EditLockStatus editing={editing} changeCount={changes.length} />
                  <EditLockActions
                    editing={editing}
                    dirty={changes.length > 0}
                    saving={saving}
                    onEdit={() => setEditing(true)}
                    onDiscard={discard}
                    saveLabel="Review & save"
                  />
                </div>
              </div>
            </>
          )}
          <ReviewChangesDialog open={reviewOpen} onOpenChange={setReviewOpen} changes={changes} onConfirm={save} />
        </form>
      )}
    </div>
  );
}
