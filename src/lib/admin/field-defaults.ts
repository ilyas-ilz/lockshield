import type { FieldConfig } from "./field-types";
import { getPath, setPath } from "./object-path";

/** A picked dropdown option, converted to the type the server validates. */
export function selectValue(field: FieldConfig, option: string): string | number {
  return field.valueType === "number" ? Number(option) : option;
}

/**
 * The value a field starts with when the record has none.
 *
 * WHY selects fall back to their first option: the dropdown used to *display*
 * options[0] for an empty value without ever putting it in the form state, so
 * a required select left untouched (Project sector/emirate) was sent as
 * missing and the save failed "Required" while the form looked complete.
 * Seeding the state with the same value makes what you see what gets saved.
 */
export function fieldDefault(field: FieldConfig): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "select" && field.options?.length) return selectValue(field, field.options[0]!);
  return undefined;
}

/** Returns `values` with every field it lacks set to that field's default. Never mutates. */
export function withFieldDefaults(
  fields: readonly FieldConfig[],
  values: Record<string, unknown>
): Record<string, unknown> {
  let out = { ...values };
  for (const field of fields) {
    const value = fieldDefault(field);
    if (value !== undefined && getPath(out, field.name) === undefined) out = setPath(out, field.name, value);
  }
  return out;
}
