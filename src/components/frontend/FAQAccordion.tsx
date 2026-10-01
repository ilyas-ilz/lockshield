"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

/** Numbered card accordion: each row is its own rounded card with a 01/02
 * index, the question, and a round chevron chip. The open row tints to
 * brand-50 and fills the chip so it reads as the active card at a glance. */
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  // useId keeps panel ids unique when a CMS page renders more than one FAQ block.
  const baseId = React.useId();

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const buttonId = `${baseId}-q${idx}`;
        const panelId = `${baseId}-a${idx}`;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300 ${
              isOpen
                ? "border-brand-200 bg-brand-50/70 shadow-[0_18px_40px_-30px_rgba(224,27,36,0.45)]"
                : "border-[var(--marketing-line)] bg-white hover:border-brand-200"
            }`}
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="group flex w-full cursor-pointer items-center gap-4 p-5 text-left sm:gap-5 sm:p-6"
              >
                <span className="w-7 shrink-0 font-tech text-xs font-semibold tabular-nums tracking-wider text-brand-500">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-semibold leading-snug text-navy-900 transition-colors group-hover:text-brand-500 sm:text-base">
                  {item.q}
                </span>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    isOpen ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-500 group-hover:bg-brand-100"
                  }`}
                >
                  <ChevronDown
                    className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
            </h3>
            {/* grid-rows animation: keeps the answer in the DOM so
                open/close transitions height + opacity instead of popping
                the whole column taller in one frame. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                {/* sm:pl = card padding + index column + gap, so the answer
                    lines up under the question text. Phones drop the indent
                    to keep a readable measure on a ~340px card. */}
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink/70 sm:pb-6 sm:pl-[4.5rem] sm:pr-16 sm:text-[15px]">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
