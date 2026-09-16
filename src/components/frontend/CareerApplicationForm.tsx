"use client";

import * as React from "react";
import { Send, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CareerApplicationFormProps {
  jobTitle: string;
  /** Real Mongo _id when backed by a live Job document; omitted for the static fallback listings. */
  jobId?: string;
  onClose: () => void;
}

/**
 * Wires the career page's "Apply Now" into the real lead pipeline
 * (source:"career", jobId when available) instead of a bare mailto: link -
 * these applicants land in the same admin Leads inbox as contact/AMC
 * enquiries. There is no public resume-upload endpoint (uploads require
 * staff auth by design - see lib/storage.ts), so this asks applicants to
 * email their CV rather than opening an unauthenticated upload surface.
 */
export function CareerApplicationForm({ jobTitle, jobId, onClose }: CareerApplicationFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", message: "", honeypot: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Please provide your name and email");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "career",
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: `Applying for: ${jobTitle}${form.message ? `\n\n${form.message}` : ""}`,
          jobId: jobId || undefined,
          honeypot: form.honeypot,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
      toast.success("Application received — our HR team will be in touch.");
    } catch {
      toast.error("Could not send your application. Please email careers@lockshield.ae directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--marketing-line)] bg-paper-soft p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-navy-900">Apply for {jobTitle}</h4>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application form"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-white hover:text-ink cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {success ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="mb-2 size-10 text-emerald-500" />
          <p className="text-sm font-semibold text-navy-900">Application received!</p>
          <p className="mt-1 max-w-xs text-xs text-ink/55">
            Please email your CV to <strong>careers@lockshield.ae</strong> referencing this role so our HR team can review it alongside your application.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot - hidden from real users, catches bots */}
          <input
            type="text"
            name="company"
            value={form.honeypot}
            onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="career-name" className="mb-1 block text-xs font-semibold text-ink/70">
                Full Name <span className="text-brand-500">*</span>
              </label>
              <input
                id="career-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full min-h-11 rounded-xl border border-[var(--marketing-line)] bg-white px-3.5 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="career-email" className="mb-1 block text-xs font-semibold text-ink/70">
                Email <span className="text-brand-500">*</span>
              </label>
              <input
                id="career-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full min-h-11 rounded-xl border border-[var(--marketing-line)] bg-white px-3.5 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="career-phone" className="mb-1 block text-xs font-semibold text-ink/70">Phone</label>
            <input
              id="career-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full min-h-11 rounded-xl border border-[var(--marketing-line)] bg-white px-3.5 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="career-message" className="mb-1 block text-xs font-semibold text-ink/70">A few words about your experience</label>
            <textarea
              id="career-message"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-xl border border-[var(--marketing-line)] bg-white px-3.5 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <p className="text-[11px] text-ink/50">
            After submitting, email your CV to <strong>careers@lockshield.ae</strong> referencing this role.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send className="size-4" /> Submit Application
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
