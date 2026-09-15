"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FieldConfig } from "@/lib/admin/field-types";
import { FieldInput } from "./FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

/**
 * Renders a list of rows, each shaped by `itemFields` (reuses FieldInput
 * per sub-field). Backs block sub-lists like FAQ items, testimonials,
 * steps — anywhere a block schema has `items: {a, b, c}[]`.
 */
export function ObjectArrayField({
  value,
  itemFields,
  onChange,
}: {
  value: Record<string, unknown>[];
  itemFields: FieldConfig[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const items = value ?? [];

  function updateItem(index: number, name: string, fieldValue: unknown) {
    onChange(items.map((item, i) => (i === index ? setPath(item, name, fieldValue) : item)));
  }

  function emptyItem(): Record<string, unknown> {
    const item: Record<string, unknown> = {};
    for (const f of itemFields) item[f.name] = f.defaultValue ?? "";
    return item;
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Item {i + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove item ${i + 1}`}
              className="text-[var(--danger)]"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
          <div className="space-y-3">
            {itemFields.map((f) => (
              <Field key={f.name} label={f.label} required={f.required}>
                <FieldInput field={f} value={getPath(item, f.name)} onChange={(v) => updateItem(i, f.name, v)} />
              </Field>
            ))}
          </div>
        </Card>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, emptyItem()])}>
        <Plus aria-hidden />
        Add item
      </Button>
    </div>
  );
}
