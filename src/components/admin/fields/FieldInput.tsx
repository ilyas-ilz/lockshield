"use client";

import type { FieldConfig } from "@/lib/admin/field-types";
import { ImagePicker, type PickedImage } from "./ImagePicker";
import { RichTextEditor } from "./RichTextEditor";
import { StringArrayField, StatsArrayField, ImageArrayField } from "./ArrayFields";
import { ObjectArrayField } from "./ObjectArrayField";
import { ObjectField } from "./ObjectField";
import { BlockEditor } from "./BlockEditor";
import type { Block } from "@/lib/blocks/schemas";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Central dispatcher: every field in every ResourceForm (and every block's
 * own fields) renders through here, switching on FieldConfig.type. This is
 * the one place that has to know about every field shape in the system. */
export function FieldInput({
  field,
  value,
  onChange,
  id,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
  id?: string;
}) {
  switch (field.type) {
    case "text":
    case "slug":
      return (
        <Input
          id={id}
          value={(value as string) ?? ""}
          required={field.required}
          onChange={(e) => onChange(field.type === "slug" ? slugify(e.target.value) : e.target.value)}
          className={field.type === "slug" ? "font-mono text-[13px]" : undefined}
        />
      );
    case "textarea":
      return <Textarea id={id} rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "richtext":
      return (
        <RichTextEditor
          id={id}
          value={value as Parameters<typeof RichTextEditor>[0]["value"]}
          onChange={(val) => onChange(val)}
        />
      );
    case "number":
      return (
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          value={(value as number) ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case "boolean":
      return (
        <label className="inline-flex cursor-pointer items-center gap-2.5 min-h-11 sm:min-h-0">
          <input
            id={id}
            type="checkbox"
            className="size-4 accent-[var(--color-brand-500)]"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm text-muted">{value ? "Enabled" : "Disabled"}</span>
        </label>
      );
    case "select":
      return (
        <Select
          id={id}
          value={(value as string) ?? field.options?.[0] ?? ""}
          onValueChange={onChange}
          options={(field.options ?? []).map((opt) => ({ value: opt, label: opt }))}
        />
      );
    case "multiselect": {
      const selected = new Set((value as string[]) ?? []);
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const isOn = selected.has(opt);
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={isOn}
                onClick={() => {
                  const next = new Set(selected);
                  if (isOn) next.delete(opt);
                  else next.add(opt);
                  onChange(Array.from(next));
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors min-h-9",
                  isOn
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
                    : "border-app bg-surface text-app hover:bg-surface-2"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }
    case "image":
      return <ImagePicker value={(value as PickedImage) ?? null} onChange={onChange} />;
    case "imageArray":
      return <ImageArrayField value={(value as PickedImage[]) ?? []} onChange={onChange} />;
    case "stringArray":
      return <StringArrayField value={(value as string[]) ?? []} onChange={onChange} />;
    case "statsArray":
      return <StatsArrayField value={(value as { value: string; label: string }[]) ?? []} onChange={onChange} />;
    case "objectArray":
      return (
        <ObjectArrayField
          value={(value as Record<string, unknown>[]) ?? []}
          itemFields={field.itemFields ?? []}
          onChange={onChange}
        />
      );
    case "object":
      return (
        <ObjectField
          value={value as Record<string, unknown> | undefined}
          itemFields={field.itemFields ?? []}
          onChange={onChange}
        />
      );
    case "blocks":
      return <BlockEditor value={(value as Block[]) ?? []} onChange={onChange} />;
    default:
      return null;
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
