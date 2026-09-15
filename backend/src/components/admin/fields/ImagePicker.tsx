"use client";

import * as React from "react";
import { ImagePlus, Trash2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PickedImage {
  url: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
}

interface SignResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Uploads directly browser -> Cloudinary using a server-issued signature
 * (see /api/upload/sign + lib/cloudinary.ts — WHY: avoids routing large
 * images through a serverless function's request-body limit), then
 * registers the asset in our Media collection so alt text lives with it.
 */
export function ImagePicker({
  value,
  onChange,
}: {
  value: PickedImage | null;
  onChange: (img: PickedImage | null) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const sign = await api.post<SignResponse>("/api/upload/sign", { folder: "media" });

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sign.apiKey);
      form.append("timestamp", String(sign.timestamp));
      form.append("signature", sign.signature);
      form.append("folder", sign.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      const uploaded = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploaded?.error?.message ?? "Upload failed");

      const picked: PickedImage = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        width: uploaded.width,
        height: uploaded.height,
        alt: value?.alt ?? "",
      };
      onChange(picked);

      await api.post("/api/media", { ...picked, alt: picked.alt || "Needs alt text" }).catch(() => {});
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. Check that the Cloudinary keys are set in .env.`
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  if (!value?.url) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-app bg-surface-2/40 px-4 py-8 text-sm text-muted transition-colors hover:bg-surface-2 disabled:opacity-60 cursor-pointer"
        >
          <ImagePlus className="size-5" aria-hidden />
          {uploading ? "Uploading…" : "Click to upload an image"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-app p-3">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview thumbnail, not the optimized public site */}
        <img src={value.url} alt={value.alt || "Preview"} className="size-20 shrink-0 rounded-md border border-app object-cover" />
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            placeholder="Alt text — describe the image"
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          <Button type="button" variant="ghost" size="sm" className="text-[var(--danger)]" onClick={() => onChange(null)}>
            <Trash2 aria-hidden />
            Remove
          </Button>
        </div>
      </div>
      {!value.alt && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--warning)]">
          <AlertTriangle className="size-3.5" aria-hidden />
          Alt text is required — it&apos;s needed for accessibility and image SEO.
        </p>
      )}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
