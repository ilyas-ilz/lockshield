"use client";

import { Plus, Trash2 } from "lucide-react";
import { ImagePicker, type PickedImage } from "./ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function StringArrayField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const items = value ?? [];
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove item ${i + 1}`}
            className="shrink-0 text-[var(--danger)]"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus aria-hidden />
        Add
      </Button>
    </div>
  );
}

interface StatItem {
  value: string;
  label: string;
}

export function StatsArrayField({ value, onChange }: { value: StatItem[]; onChange: (v: StatItem[]) => void }) {
  const items = value ?? [];
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Value — e.g. 480"
            className="sm:w-32"
            value={item.value}
            onChange={(e) => onChange(items.map((v, idx) => (idx === i ? { ...v, value: e.target.value } : v)))}
          />
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Label — e.g. detectors installed"
              value={item.label}
              onChange={(e) => onChange(items.map((v, idx) => (idx === i ? { ...v, label: e.target.value } : v)))}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove stat ${i + 1}`}
              className="shrink-0 text-[var(--danger)]"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, { value: "", label: "" }])}>
        <Plus aria-hidden />
        Add stat
      </Button>
    </div>
  );
}

export function ImageArrayField({ value, onChange }: { value: PickedImage[]; onChange: (v: PickedImage[]) => void }) {
  const items = value ?? [];
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className="p-3">
          <ImagePicker
            value={item}
            onChange={(img) => onChange(items.map((v, idx) => (idx === i ? (img as PickedImage) : v)).filter(Boolean))}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-[var(--danger)]"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 aria-hidden />
            Remove from gallery
          </Button>
        </Card>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, { url: "", alt: "" }])}>
        <Plus aria-hidden />
        Add image
      </Button>
    </div>
  );
}
