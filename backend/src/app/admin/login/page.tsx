"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

// WHY the Suspense wrapper: useSearchParams() opts the page out of static
// prerendering unless it's inside a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        // WHY this maps codes instead of showing the raw error: Auth.js
        // reports every credential failure as "CredentialsSignin", so a
        // locked account, a stopped database and a typo all looked
        // identical. The server encodes the real reason in `code`
        // (lib/auth.ts) — see the doctor script for the rest.
        setError(messageForCode(result.code));
        setLoading(false);
        return;
      }

      router.push(searchParams.get("callbackUrl") || "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the dev server still running?");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-app px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-brand-500)] shadow-sm">
            <ShieldCheck className="size-6 text-white" aria-hidden />
          </div>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">Lock Shield Admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your website content.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-app bg-surface p-5 sm:p-6">
          {error && (
            <div
              role="alert"
              className="flex gap-2.5 rounded-lg border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger)]"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lockshield.ae"
            />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2.5 text-muted hover:bg-surface-2"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </Field>

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Locked out or forgot the password? Run <code className="rounded bg-surface-2 px-1 py-0.5">npm run doctor</code> to
          see what&apos;s wrong.
        </p>
      </div>
    </div>
  );
}

function messageForCode(code: string | undefined): string {
  switch (code) {
    case "locked":
      return "Too many failed attempts — this account is temporarily locked. Wait 15 minutes, or run `npm run admin:unlock`.";
    case "rate_limited":
      return "Too many sign-in attempts from this device. Please wait a few minutes and try again.";
    case "inactive":
      return "This account has been deactivated. Ask an administrator to re-enable it.";
    case "db_unavailable":
      return "Cannot reach the database. Check that MongoDB is running and MONGODB_URI is correct — `npm run doctor` will tell you.";
    default:
      return "Incorrect email or password.";
  }
}
