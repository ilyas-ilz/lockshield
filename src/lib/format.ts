export interface AddressParts {
  street?: string;
  locality?: string;
  country?: string;
}

// Settings stores the ISO code (schema.org addressCountry wants "AE"), but
// visitors read "UAE".
const COUNTRY_NAMES: Record<string, string> = { AE: "UAE" };

/**
 * The one-line address shown in the footer and on the contact page. Each part
 * falls back to the head office so the line stays whole when Settings is
 * unreachable or a field was left blank.
 */
export function formatAddressLine(address: AddressParts | undefined): string {
  const country = address?.country?.trim() || "AE";
  return [
    address?.street?.trim() || "Hor Al Anz, Deira",
    address?.locality?.trim() || "Dubai",
    COUNTRY_NAMES[country.toUpperCase()] ?? country,
  ].join(", ");
}

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
