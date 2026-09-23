"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Send, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ServiceSelect } from "./ServiceSelect";

export interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultService?: string;
}

export function QuoteModal({ open, onOpenChange, defaultService }: QuoteModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    serviceInterest: defaultService || "",
    message: "",
    honeypot: "",
  });

  React.useEffect(() => {
    if (defaultService) {
      setFormData((prev) => ({ ...prev, serviceInterest: defaultService }));
    }
  }, [defaultService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Please provide at least your name and phone number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          serviceInterest: formData.serviceInterest || undefined,
          message: formData.message || undefined,
          source: "contact",
          honeypot: formData.honeypot,
        }),
      });

      if (!res.ok) {
        // WHY not the raw server text: a 500 showed visitors "Internal server
        // error". Only the rate-limit message is written for visitors.
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          res.status === 429 && errorData?.error
            ? errorData.error
            : "Could not send your request. Please try again or call us directly."
        );
      }

      setSuccess(true);
      toast.success("Quote request received! Our engineering team will contact you shortly.");
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          serviceInterest: defaultService || "",
          message: "",
          honeypot: "",
        });
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit quote request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#e01b24]/10 text-[#e01b24]">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-gray-900">
                  Request a Free Quote
                </DialogPrimitive.Title>
                <p className="text-xs text-gray-500 mt-0.5">
                  Civil Defence approved consultants & engineers
                </p>
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-14 text-emerald-500 mb-3 animate-bounce" />
              <h3 className="text-lg font-bold text-gray-900">Thank You!</h3>
              <p className="text-sm text-gray-600 mt-1 max-w-xs">
                Your enquiry has been received. Our fire protection specialist will call you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Honeypot - hidden from real users, catches bots */}
              <input
                type="text"
                name="company"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-[#e01b24]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammed Al Hashimi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-[#e01b24]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service of Interest
                </label>
                <ServiceSelect
                  value={formData.serviceInterest}
                  onValueChange={(v) => setFormData({ ...formData, serviceInterest: v })}
                  defaultService={defaultService}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Project Details or Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your property, location, or requirements…"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#e01b24] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e01b24]/20 hover:bg-[#b3121a] active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting Enquiry…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Send Free Quote Request
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-gray-400">
                🔒 Your information is private and strictly used for quote quotation.
              </p>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
