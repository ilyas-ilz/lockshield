/**
 * Returns only the top-level keys of `current` whose value differs from
 * `original` (deep compare via JSON).
 *
 * WHY: Settings saves every tab in one PATCH. Resending untouched fields
 * meant one stale invalid value already in the database (e.g. a 78-char SEO
 * title written before validation existed) blocked every unrelated save,
 * such as fixing the address. Sending only what the admin changed means the
 * server validates only what the admin changed.
 */
export function changedKeys(
  original: Record<string, unknown>,
  current: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(current)) {
    if (JSON.stringify(value) !== JSON.stringify(original[key])) out[key] = value;
  }
  return out;
}
