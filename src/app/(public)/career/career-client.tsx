"use client";

import * as React from "react";
import { MapPin, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import { CareerApplicationForm } from "@/components/frontend/CareerApplicationForm";
import { TiptapRenderer, type TiptapNode } from "@/components/frontend/BlockRenderer";
import type { JobOpening } from "@/lib/jobs";

/**
 * WHY both shapes: the admin's rich-text field saves Tiptap JSON. Only
 * plain strings used to render, so every admin-created job showed a
 * "details available upon enquiry" placeholder instead of its description.
 */
function JobDescription({ description }: { description: unknown }) {
  if (!description) return null;
  if (typeof description === "string") {
    return <p className="mt-4 text-sm leading-relaxed text-ink/65">{description}</p>;
  }
  return (
    <div className="mt-4 text-sm leading-relaxed text-ink/65 [&_p]:mb-2 [&_p]:text-sm [&_p]:text-ink/65 [&_ul]:mb-2 [&_ul]:text-sm [&_ol]:mb-2 [&_ol]:text-sm">
      <TiptapRenderer content={description as TiptapNode} />
    </div>
  );
}

export function CareerJobList({ jobs }: { jobs: JobOpening[] }) {
  const [openJob, setOpenJob] = React.useState<string | null>(null);

  return (
    <div className="space-y-5 sm:space-y-6">
      {jobs.map((job) => {
        const isOpen = openJob === job._id;
        return (
          <div
            key={job._id}
            className="rounded-3xl border border-[var(--marketing-line)] bg-white p-5 shadow-xs transition-all hover:border-brand-500/50 hover:shadow-md sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-500">{job.department}</span>
                <h3 className="font-tech mt-1 text-lg font-bold uppercase text-navy-900 sm:text-2xl">{job.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink/55">
                <span className="flex items-center gap-1 rounded-full bg-paper-soft px-3 py-1.5 font-medium">
                  <MapPin className="size-3.5 text-brand-500" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-paper-soft px-3 py-1.5 font-medium">
                  <Clock className="size-3.5 text-blue-500" />
                  {job.employmentType}
                </span>
              </div>
            </div>

            <JobDescription description={job.description} />

            {job.requirements.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-[var(--marketing-line)] pt-4">
                <h4 className="text-xs font-bold uppercase text-ink/70">Key Requirements:</h4>
                <ul className="space-y-1.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink/60">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 border-t border-[var(--marketing-line)] pt-4">
              <button
                type="button"
                onClick={() => setOpenJob(isOpen ? null : job._id)}
                aria-expanded={isOpen}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-600 cursor-pointer"
              >
                <span>{isOpen ? "Close Application" : "Apply Now"}</span>
                <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {isOpen && (
              <CareerApplicationForm jobTitle={job.title} jobId={job._id} onClose={() => setOpenJob(null)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * "Don't see your role?" used to link to /contact — the quote form, with AMC
 * preselected — so open applications arrived looking like AMC enquiries.
 * This keeps them in the career pipeline (source "career").
 */
export function OpenApplication({ buttonLabel = "Send an Open Application" }: { buttonLabel?: string }) {
  const [open, setOpen] = React.useState(false);

  if (open) {
    return <CareerApplicationForm jobTitle="Open application" onClose={() => setOpen(false)} />;
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-expanded={false}
      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-600 cursor-pointer"
    >
      {buttonLabel}
    </button>
  );
}
