"use client";

import * as React from "react";
import { Send, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function QuickQuoteForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    serviceInterest: "Annual Maintenance Contract (AMC)",
    message: "",
  });

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
          serviceInterest: form.serviceInterest,
          message: form.message || undefined,
          source: "contact",
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setSuccess(true);
      toast.success("Enquiry received! Our engineers will call you shortly.");
      setForm({
        name: "",
        phone: "",
        email: "",
        serviceInterest: "Annual Maintenance Contract (AMC)",
        message: "",
      });
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
              <select
                value={form.serviceInterest}
                onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all cursor-pointer"
              >
                <option value="Annual Maintenance Contract (AMC)">Annual Maintenance Contract (AMC)</option>
                <option value="Civil Defence Approval & Drawing">Civil Defence Approval & Drawing</option>
                <option value="FM-200 / Clean Agent System">FM-200 / Clean Agent System</option>
                <option value="Kitchen Fire Suppression System">Kitchen Fire Suppression System</option>
                <option value="Fire Extinguisher Refilling & Supply">Fire Extinguisher Refilling & Supply</option>
                <option value="Fire Alarm & Detection Systems">Fire Alarm & Detection Systems</option>
                <option value="Fire Fighting Sprinklers & Pumps">Fire Fighting Sprinklers & Pumps</option>
              </select>
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
