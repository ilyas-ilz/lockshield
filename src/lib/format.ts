/**
 * Display-format a UAE phone number.
 *
 * WHY: the real Settings.phones value in production is a bare digit string
 * ("+971528434801", no spaces) - visually illegible. Groups the two shapes
 * UAE numbers actually come in (9-digit mobile, 8-digit landline+area-code);
 * anything else is left exactly as entered rather than risk mangling a
 * format we don't recognize.
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("971")) return phone;
  const rest = digits.slice(3);
  if (rest.length === 9) return `+971 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  if (rest.length === 8) return `+971 ${rest.slice(0, 1)} ${rest.slice(1, 4)} ${rest.slice(4)}`;
  return phone;
}
