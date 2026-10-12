"use client";

import * as React from "react";
import { api } from "@/lib/admin/api-client";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RelationConfig } from "@/lib/admin/field-types";

interface OptionItem {
  _id: string;
  name?: string;
  title?: string;
}

function labelOf(item: OptionItem, labelKey?: string): string {
  if (labelKey) {
    const rec = item as unknown as Record<string, unknown>;
    if (typeof rec[labelKey] === "string") return String(rec[labelKey]);
  }
  return item.name ?? item.title ?? item._id;
}

/**
 * Single-reference picker (e.g. Post.category -> Category._id).
 * Options load from the relation list endpoint; value is the referenced
 * _id string or undefined for "none". An explicit "None" option keeps an
 * optional ref truly optional — an empty string would fail the server's
 * objectId validation, so blank is normalized to undefined here.
 */
export function RelationField({
  value,
  onChange,
  id,
  relation,
  placeholder = "None",
}: {
  value: unknown;
  onChange: (v: string | undefined) => void;
  id?: string;
  relation: RelationConfig;
  placeholder?: string;
}) {
  const [options, setOptions] = React.useState<OptionItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ items: OptionItem[] }>(`${relation.apiPath}?pageSize=100`);
        if (!cancelled) setOptions(res.items ?? []);
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [relation.apiPath]);

  const current = typeof value === "string" && value.length > 0 ? value : "";
  // The referenced doc may have been deleted since — still show its id so
  // the edit form doesn't silently drop the value.
  const knownIds = new Set(options.map((o) => o._id));
  const orphan = current && !knownIds.has(current) ? [{ _id: current, name: `${current} (removed)` }] : [];

  return (
    <Select
      id={id}
      value={current}
      disabled={loading}
      onValueChange={(v) => onChange(v === "" ? undefined : v)}
      options={[
        { value: "", label: loading ? "Loading…" : placeholder },
        ...[...orphan, ...options].map((o) => ({ value: o._id, label: labelOf(o, relation.labelKey) })),
      ]}
    />
  );
}

/**
 * Multi-reference picker (e.g. Post.tags -> Tag._id[]).
 * Server defaults to [] when omitted; the form always submits an array so
 * clearing every chip reads as "no tags" rather than "leave unchanged".
 */
export function RelationArrayField({
  value,
  onChange,
  relation,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
  relation: RelationConfig;
}) {
  const [options, setOptions] = React.useState<OptionItem[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ items: OptionItem[] }>(`${relation.apiPath}?pageSize=100`);
        if (!cancelled) setOptions(res.items ?? []);
      } catch {
        if (!cancelled) setOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [relation.apiPath]);

  const selected = new Set(Array.isArray(value) ? (value as string[]) : []);
  // Same orphan handling as the single picker: keep stale ids visible.
  const knownIds = new Set(options.map((o) => o._id));
  const orphans: OptionItem[] = [...selected].filter((id) => !knownIds.has(id)).map((id) => ({ _id: id, name: `${id} (removed)` }));

  return (
    <div className="flex flex-wrap gap-2">
      {[...orphans, ...options].map((opt) => {
        const isOn = selected.has(opt._id);
        return (
          <button
            key={opt._id}
            type="button"
            aria-pressed={isOn}
            onClick={() => {
              const next = new Set(selected);
              if (isOn) next.delete(opt._id);
              else next.add(opt._id);
              onChange(Array.from(next));
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors min-h-9",
              isOn
                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
                : "border-app bg-surface text-app hover:bg-surface-2"
            )}
          >
            {labelOf(opt, relation.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
