"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Skeleton } from "@/components/ui/card";
import { Input, Field } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";

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

  const load = useCallback(async () => {
    setError(null);
    try {
      setUser(await api.get<UserData>(`/api/users/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <>
      <PageHeader title="Edit user" />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !user ? (
        <Card className="max-w-lg">
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
        <form onSubmit={handleSubmit} className="max-w-lg">
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

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
              <ArrowLeft aria-hidden />
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {!saving && <Save aria-hidden />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
