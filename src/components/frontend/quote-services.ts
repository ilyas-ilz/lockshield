/**
 * Single list for both quote forms (QuickQuoteForm + QuoteModal) — they used
 * to hardcode their own, slightly different, copies.
 */
export const QUOTE_SERVICES = [
  "Annual Maintenance Contract (AMC)",
  "Civil Defence Approval & Drawing",
  "FM-200 / Clean Agent System",
  "Kitchen Fire Suppression System",
  "Fire Extinguisher Refilling & Supply",
  "Fire Alarm & Detection Systems",
  "Fire Fighting Sprinklers & Pumps",
  "Emergency Lights & Exit Signs",
] as const;

/**
 * Options for the service dropdown. A service page preselects its own title;
 * when that title isn't one of the generic options it goes first so the
 * dropdown can actually show it (a <select> can't display a value it has no
 * <option> for).
 */
export function quoteServiceOptions(defaultService?: string): string[] {
  const base: string[] = [...QUOTE_SERVICES];
  if (!defaultService || base.includes(defaultService)) return base;
  return [defaultService, ...base];
}
