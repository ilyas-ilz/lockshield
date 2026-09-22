"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { Field, PasswordInput } from "@/components/ui/input";

/** Mirrors isPasswordStrong() on the server so the rules are visible up front. */
const RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 10 characters", test: (v) => v.length >= 10 },
  { label: "An upper and a lower case letter", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
];

export function AccountClient({ name, email, role }: { name: string; email: string; role: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unmetRule = RULES.find((rule) => !rule.test(newPassword));
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const sameAsCurrent = newPassword.length > 0 && newPassword === currentPassword;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // Checked here so the user gets the reason without a round trip; the
    // server re-checks all of it and remains the authority.
    if (unmetRule) return setError(`New password needs: ${unmetRule.label.toLowerCase()}.`);
    if (sameAsCurrent) return setError("New password must be different from your current one.");
    if (newPassword !== confirmPassword) return setError("The two new passwords do not match.");

    setSaving(true);
    try {
      await api.post("/api/users/me/password", { currentPassword, newPassword });
      toast.success("Password updated — use it next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Could not update password";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-5">
        <CardContent className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-app bg-surface-2 text-sm font-bold uppercase text-foreground">
            {(name || email || "?").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-app">{name || "Staff member"}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <Badge tone={role === "ADMIN" ? "brand" : "neutral"} className="ml-auto shrink-0 text-[10px]">
            {role}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          {/* WHY a hidden username field: Chrome warns "Password forms should
              have (optionally hidden) username fields for accessibility", and
              without one a password manager cannot tell which account the new
              password belongs to — it either skips the save prompt or attaches
              it to the wrong entry. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={email}
            readOnly
            hidden
            aria-hidden
            tabIndex={-1}
          />

          <Field label="Current password" htmlFor="currentPassword" required>
            <PasswordInput
              id="currentPassword"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>

          <Field label="New password" htmlFor="newPassword" required>
            <PasswordInput
              id="newPassword"
              required
              minLength={10}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <ul className="mt-2 space-y-1">
              {RULES.map((rule) => {
                const met = rule.test(newPassword);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-muted"}`}
                  >
                    <ShieldCheck className={`size-3.5 ${met ? "opacity-100" : "opacity-40"}`} aria-hidden />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </Field>

          <Field
            label="Confirm new password"
            htmlFor="confirmPassword"
            required
            error={mismatch ? "The two new passwords do not match." : undefined}
          >
            <PasswordInput
              id="confirmPassword"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>

          {error && !mismatch && (
            <p role="alert" className="text-xs font-medium text-[var(--danger)]">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-5 flex justify-end">
        <Button type="submit" variant="primary" loading={saving}>
          {!saving && <KeyRound aria-hidden />}
          {saving ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
