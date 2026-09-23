"use client";

import * as React from "react";
import { ImagePlus, Trash2, AlertTriangle, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaModal } from "./MediaModal";

export interface PickedImage {
  url: string;
  publicId?: string;
  storage?: "local" | "spaces" | "cloudinary";
  alt: string;
  width?: number;
  height?: number;
}

export function ImagePicker({
  value,
  onChange,
  onOpenMediaModal,
}: {
  value: PickedImage | null;
  onChange: (img: PickedImage | null) => void;
  onOpenMediaModal?: () => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const openLibrary = onOpenMediaModal || (() => setLibraryOpen(true));

  function uploadWithProgress(file: File): Promise<PickedImage> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "media");
      formData.append("alt", value?.alt || "");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              url: data.url,
              publicId: data.publicId,
              storage: data.storage,
              width: data.width,
              height: data.height,
              alt: data.alt || value?.alt || "",
            });
          } catch {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData?.error || "Upload failed"));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload"));
      };

      xhr.send(formData);
    });
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, SVG, GIF)");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const picked = await uploadWithProgress(file);
      onChange(picked);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed"
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  if (!value?.url) {
    return (
      <div className="space-y-2">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInput.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition-all cursor-pointer ${
            dragActive
              ? "border-[var(--brand-red,#e01b24)] bg-brand/5 scale-[0.99]"
              : "border-app bg-surface-2/40 hover:bg-surface-2 hover:border-app-hover"
          } ${uploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <Loader2 className="size-6 animate-spin text-brand" />
              <span className="text-xs text-muted font-medium">Uploading image… {progress}%</span>
              <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="size-10 rounded-full bg-surface-2 flex items-center justify-center text-muted">
                <ImagePlus className="size-5" aria-hidden />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted">
                  SVG, PNG, JPG, WebP, or GIF (max 10MB)
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openLibrary();
                }}
              >
                <FolderOpen className="size-3.5 mr-1" />
                Select from Library
              </Button>
            </>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}

        <MediaModal
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          onSelect={(img) => onChange(img)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-app bg-surface p-3">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview thumbnail */}
        <img
          src={value.url}
          alt={value.alt || "Preview"}
          className="size-20 shrink-0 rounded-md border border-app object-cover bg-surface-2"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            placeholder="Alt text — describe the image for accessibility & SEO"
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10"
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-3.5 mr-1" aria-hidden />
              Remove
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted"
              onClick={openLibrary}
            >
              <FolderOpen className="size-3.5 mr-1" />
              Change image
            </Button>
          </div>
        </div>
      </div>
      {!value.alt && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--warning)]">
          <AlertTriangle className="size-3.5" aria-hidden />
          Alt text is recommended — it improves accessibility and image SEO.
        </p>
      )}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}

      <MediaModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={(img) => onChange(img)}
      />
    </div>
  );
}
