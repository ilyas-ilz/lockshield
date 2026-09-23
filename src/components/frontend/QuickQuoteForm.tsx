"use client";

import * as React from "react";
import { Send, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ServiceSelect } from "./ServiceSelect";

interface QuickQuoteFormProps {
  /** Preselects the service dropdown, e.g. the service page this form sits on. */
  defaultService?: string;
}

export function QuickQuoteForm({ defaultService = "" }: QuickQuoteFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // WHY no AMC default: most visitors never touch the dropdown, so a
  // preselected AMC labelled every quote from every page as an AMC enquiry.
  const emptyForm = { name: "", phone: "", email: "", serviceInterest: defaultService, message: "", honeypot: "" };
  const [form, setForm] = React.useState(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please provide your name and contact phone number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          serviceInterest: form.serviceInterest || undefined,
          message: form.message || undefined,
          source: "contact",
          honeypot: form.honeypot,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setSuccess(true);
      toast.success("Enquiry received! Our engineers will call you shortly.");
      setForm(emptyForm);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      toast.error("Could not send enquiry. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-2xl shadow-gray-200/50">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="size-10 rounded-xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h3 className="font-tech text-xl font-bold uppercase tracking-tight text-gray-900">
            Get an Instant Quotation
          </h3>
          <p className="text-xs text-gray-500">Free site visit & engineering consultation</p>
        </div>
      </div>

      {success ? (
        <div className="py-8 text-center flex flex-col items-center">
          <CheckCircle2 className="size-12 text-emerald-500 mb-2" />
          <h4 className="font-bold text-gray-900">Thank You!</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Your request has been forwarded to our engineering desk. We will call you within 15 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Name <span className="text-[#e01b24]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number <span className="text-[#e01b24]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+971 50 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="your.email@company.ae"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Service Required</label>
              <ServiceSelect
                  value={form.serviceInterest}
                  onValueChange={(v) => setForm({ ...form, serviceInterest: v })}
                  defaultService={defaultService}
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Project Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Warehouse in Al Quoz, restaurant kitchen fitout, or building AMC..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#e01b24] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e01b24]/20 hover:bg-[#b3121a] active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting Request…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Submit Free Quote Request
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
