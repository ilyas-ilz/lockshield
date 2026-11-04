/**
 * Copy shared by the public forms' success popup (SubmissionSuccessDialog).
 * The steps restate promises the site already makes elsewhere (15-minute
 * call-back, free site visit, Civil Defence approved quotation) — don't add
 * new commitments here that the business hasn't made.
 */
export const QUOTE_NEXT_STEPS = [
  "An engineer calls you back within 15 minutes",
  "We arrange a free site visit and survey",
  "You receive a Civil Defence approved quotation",
] as const;

/** First word of a typed name, for a personal greeting. Empty when blank. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
