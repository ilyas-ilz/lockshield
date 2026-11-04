import type { FieldConfig } from "./field-types";
import { getPath } from "./object-path";

/** One field the admin changed, rendered for the "review changes" dialog. */
export interface FieldChange {
  name: string;
  label: string;
  before: string;
  after: string;
}

const MAX_LEN = 200;

/**
 * Lists the configured fields whose value differs between the last saved
 * state and the edited one, as human-readable before/after text.
 *
 * WHY: saved settings and records used to be live inputs, so a stray
 * keystroke (e.g. one digit of a phone number) was saved with everything
 * else. The save now shows this list for confirmation first.
 */
export function diffFields(
  fields: readonly FieldConfig[],
  before: Record<string, unknown>,
  after: Record<string, unknown>
): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const field of fields) {
    const a = normalize(getPath(before, field.name));
    const b = normalize(getPath(after, field.name));
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    changes.push({
      name: field.name,
      label: field.label,
      before: formatFieldValue(a),
      after: formatFieldValue(b),
    });
  }
  return changes;
}

/** Readable, truncated text for any field value (strings, arrays, rich text, objects). */
export function formatFieldValue(value: unknown): string {
  const text = toText(normalize(value));
  if (!text.trim()) return "(empty)";
  return text.length > MAX_LEN ? `${text.slice(0, MAX_LEN)}…` : text;
}

// Empty string / empty array / null all mean "not set" — don't report them as changes.
function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  if (Array.isArray(value) && value.length === 0) return undefined;
  return value;
}

function toText(value: unknown): string {
  if (value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Tiptap rich-text JSON: show its text, not its structure.
    if (obj.type === "doc" || Array.isArray(obj.content)) return richText(obj).trim();
    if (typeof obj.url === "string") return obj.url;
    return Object.entries(obj)
      .filter(([k]) => !k.startsWith("_"))
      .map(([k, v]) => `${k}: ${toText(v)}`)
      .filter((s) => !s.endsWith(": "))
      .join(", ");
  }
  return String(value);
}

function richText(node: Record<string, unknown>): string {
  if (typeof node.text === "string") return node.text;
  const children = Array.isArray(node.content) ? (node.content as Record<string, unknown>[]) : [];
  return children.map(richText).join(node.type === "doc" ? " " : "");
}
