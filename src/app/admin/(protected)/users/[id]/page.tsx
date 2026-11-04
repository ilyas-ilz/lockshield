"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Skeleton } from "@/components/ui/card";
import { Input, Field } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { diffFields } from "@/lib/admin/field-diff";
import type { FieldConfig } from "@/lib/admin/field-types";
import { EditLockActions, LockedFieldset, ReviewChangesDialog } from "@/components/admin/edit-lock";

// Labels for the change review (only the fields this page can change).
const REVIEW_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "role", label: "Role", type: "select" },
  { name: "active", label: "Access active", type: "boolean" },
];

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
}

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const changes = useMemo(
    () =>
      user && saved
        ? diffFields(REVIEW_FIELDS, saved as unknown as Record<string, unknown>, user as unknown as Record<string, unknown>)
        : [],
    [user, saved]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const loaded = await api.get<UserData>(`/api/users/${id}`);
      setUser(loaded);
      setSaved(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !user) return;
    if (changes.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setReviewOpen(true);
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await api.patch(`/api/users/${id}`, { name: user.name, role: user.role, active: user.active });
      toast.success("User updated");
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    // WHY the centred column: this form is a narrow `max-w-lg` card, and left
    // -aligning it against a full-width content area left a large empty gutter
    // on the right at desktop widths. The header sits inside the same wrapper
    // so the title stays aligned with the card rather than drifting away
    // from it.
    <div className="mx-auto w-full max-w-lg">
      <PageHeader title="Edit user" />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !user ? (
        <Card>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <LockedFieldset locked={!editing} className="min-w-0">
          <Card>
            <CardContent className="space-y-5">
              <Field label="Name" htmlFor="name">
                <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
              </Field>

              <Field label="Email" htmlFor="email" help="Email can't be changed — create a new account instead.">
                <Input id="email" value={user.email} disabled />
              </Field>

              <Field label="Role" htmlFor="role">
                <Select
                  id="role"
                  value={user.role}
                  onValueChange={(role) => setUser({ ...user, role: role as UserData["role"] })}
                  options={[
                    { value: "EDITOR", label: "Editor — content only" },
                    { value: "ADMIN", label: "Admin — full access" },
                  ]}
                />
              </Field>

              <Field label="Access" help="Turning this off blocks sign-in immediately, without deleting their work.">
                <label className="inline-flex cursor-pointer items-center gap-2.5 min-h-11 sm:min-h-0">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-brand-500)]"
                    checked={user.active}
                    onChange={(e) => setUser({ ...user, active: e.target.checked })}
                  />
                  <span className="text-sm text-muted">{user.active ? "Active" : "Deactivated"}</span>
                </label>
              </Field>
            </CardContent>
          </Card>
          </LockedFieldset>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {!editing && (
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
                <ArrowLeft aria-hidden />
                Back
              </Button>
            )}
            <EditLockActions
              editing={editing}
              dirty={changes.length > 0}
              saving={saving}
              size="md"
              onEdit={() => setEditing(true)}
              onDiscard={() => {
                setUser(saved);
                setEditing(false);
              }}
              saveLabel="Review & save"
            />
          </div>
          <ReviewChangesDialog open={reviewOpen} onOpenChange={setReviewOpen} changes={changes} onConfirm={save} />
        </form>
      )}
    </div>
  );
}
