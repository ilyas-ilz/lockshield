"use client";

import * as React from "react";
import { nanoid } from "nanoid";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { BLOCK_TYPES, BLOCK_LABELS, type Block, type BlockType } from "@/lib/blocks/schemas";
import { BLOCK_FIELD_CONFIGS } from "@/lib/admin/block-field-configs";
import { FieldInput } from "./FieldInput";
import { getPath, setPath } from "@/lib/admin/object-path";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, Badge } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

/**
 * The block-based page editor (design doc "typed block library" — approach
 * A over freeform HTML or a full drag-drop builder). Editors add, reorder,
 * hide and remove blocks and edit each one's fields, but can never inject
 * arbitrary markup or break the layout: the set of possible blocks and
 * their shapes is fixed by the schema.
 *
 * Blocks collapse by default so a 12-section page stays navigable — you
 * expand the one you're editing rather than scrolling past every field of
 * every block.
 */
export function BlockEditor({ value, onChange }: { value: Block[]; onChange: (v: Block[]) => void }) {
  const blocks = value ?? [];
  const [addingType, setAddingType] = React.useState<BlockType>("richText");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateBlock(index: number, name: string, fieldValue: unknown) {
    onChange(
      blocks.map((b, i) =>
        i === index ? (setPath(b as unknown as Record<string, unknown>, name, fieldValue) as unknown as Block) : b
      )
    );
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const updated = [...blocks];
    [updated[index], updated[target]] = [updated[target]!, updated[index]!];
    onChange(updated);
  }

  function addBlock() {
    const id = nanoid(8);
    onChange([...blocks, { id, type: addingType, hidden: false } as Block]);
    setExpanded((prev) => new Set(prev).add(id)); // open the new block straight away
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <EmptyState
          title="No sections yet"
          description="Pages are built from sections — add a hero, some rich text, an FAQ, a call to action, and arrange them in any order."
        />
      ) : (
        <div className="space-y-2">
          {blocks.map((block, i) => {
            const isOpen = expanded.has(block.id);
            const fields = BLOCK_FIELD_CONFIGS[block.type] ?? [];
            return (
              <Card key={block.id} className={cn(block.hidden && "opacity-60")}>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <GripVertical className="size-4 shrink-0 text-muted" aria-hidden />
                  <button
                    type="button"
                    onClick={() => toggleExpanded(block.id)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-xs tabular-nums text-muted">{i + 1}</span>
                    <span className="truncate text-sm font-medium">{BLOCK_LABELS[block.type]}</span>
                    {block.hidden && <Badge tone="warning">Hidden</Badge>}
                    {isOpen ? (
                      <ChevronUp className="ml-auto size-4 shrink-0 text-muted" aria-hidden />
                    ) : (
                      <ChevronDown className="ml-auto size-4 shrink-0 text-muted" aria-hidden />
                    )}
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move section up"
                    >
                      <ChevronUp aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => move(i, 1)}
                      disabled={i === blocks.length - 1}
                      aria-label="Move section down"
                    >
                      <ChevronDown aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => updateBlock(i, "hidden", !block.hidden)}
                      aria-label={block.hidden ? "Show section" : "Hide section"}
                    >
                      {block.hidden ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-[var(--danger)]"
                      onClick={() => onChange(blocks.filter((_, idx) => idx !== i))}
                      aria-label="Delete section"
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t border-app p-3 sm:p-4">
                    {fields.length === 0 ? (
                      <p className="text-sm text-muted">This section has no options — it pulls its content automatically.</p>
                    ) : (
                      fields.map((f) => (
                        <Field key={f.name} label={f.label} required={f.required} help={f.help}>
                          <FieldInput
                            field={f}
                            value={getPath(block as unknown as Record<string, unknown>, f.name)}
                            onChange={(v) => updateBlock(i, f.name, v)}
                          />
                        </Field>
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-app p-3 sm:flex-row sm:items-center">
        <Select
          value={addingType}
          onValueChange={(v) => setAddingType(v as BlockType)}
          options={BLOCK_TYPES.map((t) => ({ value: t, label: BLOCK_LABELS[t] }))}
          className="sm:max-w-56"
        />
        <Button type="button" variant="primary" onClick={addBlock} className="sm:shrink-0">
          <Plus aria-hidden />
          Add section
        </Button>
      </div>
    </div>
  );
}
