"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FieldConfig } from "@/lib/admin/field-types";
import { FieldInput } from "./FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";

/** Single optional nested object (e.g. a block's primaryCta: {label, href}) — shows an "Add" affordance when absent rather than always rendering empty inputs. */
export function ObjectField({
  value,
  itemFields,
  onChange,
}: {
  value: Record<string, unknown> | undefined;
  itemFields: FieldConfig[];
  onChange: (v: Record<string, unknown> | undefined) => void;
}) {
  if (!value) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          const obj: Record<string, unknown> = {};
          for (const f of itemFields) obj[f.name] = f.defaultValue ?? "";
          onChange(obj);
        }}
      >
        <Plus aria-hidden />
        Add
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-app p-3">
      {itemFields.map((f) => (
        <Field key={f.name} label={f.label} required={f.required}>
          <FieldInput field={f} value={getPath(value, f.name)} onChange={(v) => onChange(setPath(value, f.name, v))} />
        </Field>
      ))}
      <Button type="button" variant="ghost" size="sm" className="text-[var(--danger)]" onClick={() => onChange(undefined)}>
        <Trash2 aria-hidden />
        Remove
      </Button>
    </div>
  );
}
