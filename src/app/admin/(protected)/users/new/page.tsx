"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Field, PasswordInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/users", form);
      toast.success("User created");
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    // Centred to match the Edit user page — see the note there.
    <div className="mx-auto w-full max-w-lg">
      <PageHeader title="New user" description="Give a colleague access to the admin." />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-5">
            <Field label="Name" htmlFor="name" required>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>

            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                required
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field
              label="Temporary password"
              htmlFor="password"
              required
              help="At least 10 characters with upper and lower case letters and a number. Share it with them out of band — they can change it themselves under My account after signing in."
            >
              <PasswordInput
                id="password"
                required
                minLength={10}
                // WHY new-password: with the default the browser offered the
                // signed-in admin's OWN saved credentials here, so creating a
                // colleague could silently submit your email and password.
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>

            <Field label="Role" htmlFor="role" required>
              <Select
                id="role"
                value={form.role}
                onValueChange={(role) => setForm({ ...form, role })}
                options={[
                  { value: "EDITOR", label: "Editor — content only" },
                  { value: "ADMIN", label: "Admin — full access, including settings and users" },
                ]}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
            <ArrowLeft aria-hidden />
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {!saving && <UserPlus aria-hidden />}
            {saving ? "Creating…" : "Create user"}
          </Button>
        </div>
      </form>
    </div>
  );
}
