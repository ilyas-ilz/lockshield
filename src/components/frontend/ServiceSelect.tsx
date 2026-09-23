"use client";

import { Select } from "@/components/ui/select";
import { quoteServiceOptions } from "./quote-services";

/** Light public-site styling of the shared Radix Select, matching the quote form inputs. */
export function ServiceSelect({
  value,
  onValueChange,
  id,
  defaultService,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  /** A service page's own title; listed first when it isn't one of the generic options. */
  defaultService?: string;
}) {
  const options = quoteServiceOptions(defaultService).map((s) => ({ value: s, label: s }));
  return (
    <Select
      id={id}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder="Select a service category"
      className="rounded-xl border-gray-200 bg-white px-3.5 text-left text-gray-900 [&>span:first-child]:min-w-0 [&>span:first-child]:truncate data-[placeholder]:text-gray-400 hover:border-gray-300 focus:border-[#e01b24] focus:outline-none focus:ring-1 focus:ring-[#e01b24] data-[state=open]:border-[#e01b24] data-[state=open]:ring-1 data-[state=open]:ring-[#e01b24] transition-all"
      contentClassName="z-[60] rounded-xl border-gray-100 bg-white shadow-2xl shadow-gray-900/10 animate-in fade-in-0 zoom-in-95 duration-150"
      itemClassName="rounded-lg py-2.5 text-gray-700 data-[highlighted]:bg-[#e01b24]/5 data-[highlighted]:text-[#e01b24] data-[state=checked]:text-[#e01b24] data-[state=checked]:font-semibold"
    />
  );
}
