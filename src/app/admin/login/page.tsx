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
    <div className="relative grid min-h-dvh place-items-center bg-app px-4 py-12 overflow-hidden">
      {/* Subtle ambient red/navy glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[var(--color-brand-500)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--color-brand-500)] text-white shadow-lg shadow-[var(--color-brand-500)]/20">
            <ShieldCheck className="size-6.5" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Lock Shield Admin</h1>
          <p className="mt-1 text-xs text-muted">Sign in to manage website content and client enquiries.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4.5 rounded-2xl border border-app bg-surface p-6 sm:p-7 shadow-xl shadow-black/5">
          {error && (
            <div
              role="alert"
              className="flex gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-bg)] p-3.5 text-xs text-[var(--danger)] leading-relaxed"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <Field label="Email address" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lockshield.ae"
              className="rounded-xl h-10 text-xs"
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
                className="pr-11 rounded-xl h-10 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-foreground hover:bg-surface-2 cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </Field>

          <Button type="submit" variant="primary" className="w-full h-10 rounded-xl shadow-xs" loading={loading}>
            {loading ? "Authenticating…" : "Sign In to Admin"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Need access or forgot password? Contact the administrator or run{" "}
          <code className="rounded-md bg-surface-2 border border-app px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            npm run doctor
          </code>
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
