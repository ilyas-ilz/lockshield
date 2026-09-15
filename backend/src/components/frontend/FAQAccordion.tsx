"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-gray-900 hover:text-[#e01b24] transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base">{item.q}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#e01b24]" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
