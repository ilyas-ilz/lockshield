"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowLeft, FileText, Inbox, Lock, Mail, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field, PasswordInput } from "@/components/ui/input";
import { safeAdminCallbackUrl } from "@/lib/safe-redirect";

const IS_DEV = process.env.NODE_ENV !== "production";

const HIGHLIGHTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Inbox, title: "Customer enquiries", text: "Quote and contact requests land here the moment they're sent." },
  { icon: FileText, title: "Content & portfolio", text: "Publish posts, services and completed projects to the live site." },
  { icon: ShieldCheck, title: "Protected access", text: "Role-based permissions and automatic lockout on repeated failures." },
];

// WHY the Suspense wrapper: useSearchParams() opts the page out of static
// prerendering unless it's inside a Suspense boundary.
export default function LoginPage() {
  return (
    <div className="grid min-h-dvh bg-app lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <BrandPanel />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-navy-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Blueprint grid + brand glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />

      <Link href="/" className="relative flex items-center gap-3 self-start">
        <Image src="/assets/images/logo-shield.webp" alt="" width={44} height={45} priority className="size-11" />
        <span className="flex flex-col">
          <span className="font-tech text-xl font-bold uppercase leading-none tracking-tight">Lock Shield</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60">Admin Suite</span>
        </span>
      </Link>

      <div className="relative max-w-md">
        <p className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
          Run the website behind <span className="text-brand-400">UAE fire safety</span> work.
        </p>
        <ul className="mt-10 space-y-6">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <item.icon className="size-5 text-brand-400" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-white/60">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/40">
        &copy; {new Date().getFullYear()} Lock Shield Firefighting &amp; Safety Equipment Installation LLC
      </p>
    </aside>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      router.push(safeAdminCallbackUrl(searchParams.get("callbackUrl")));
      router.refresh();
    } catch {
      setError(IS_DEV ? "Could not reach the server. Is the dev server still running?" : "Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-4 py-5 sm:px-8 lg:min-h-0">
      {/* Mobile-only ambient glow (the brand panel carries it on desktop) */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl lg:hidden" aria-hidden />

      <div className="relative flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-2 rounded-xl px-2 -ml-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Back to website
        </Link>
      </div>

      <div className="relative flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Image
              src="/assets/images/logo-shield.webp"
              alt=""
              width={44}
              height={45}
              priority
              className="mb-5 size-12 lg:hidden"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted">Sign in to the Lock Shield admin panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="flex gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-bg)] p-3.5 text-sm text-[var(--danger)] leading-relaxed"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <Field label="Email address" htmlFor="email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lockshield.ae"
                  className="h-12 rounded-xl pl-10"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password" required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl pl-10"
                />
              </div>
            </Field>

            <Button type="submit" variant="primary" size="lg" className="h-12 w-full rounded-xl text-sm font-semibold shadow-xs" loading={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

// WHY the IS_DEV split: the tooling hints (npm scripts, MONGODB_URI) help a
// developer but are noise, and a small recon leak, on the public prod page.
function messageForCode(code: string | undefined): string {
  switch (code) {
    case "locked":
      return IS_DEV
        ? "Too many failed attempts — this account is temporarily locked. Wait 15 minutes, or run `npm run admin:unlock`."
        : "Too many failed attempts — this account is temporarily locked. Please try again in 15 minutes.";
    case "rate_limited":
      return "Too many sign-in attempts from this device. Please wait a few minutes and try again.";
    case "inactive":
      return "This account has been deactivated. Ask an administrator to re-enable it.";
    case "db_unavailable":
      return IS_DEV
        ? "Cannot reach the database. Check that MongoDB is running and MONGODB_URI is correct — `npm run doctor` will tell you."
        : "Sign-in is temporarily unavailable. Please try again shortly.";
    default:
      return "Incorrect email or password.";
  }
}
