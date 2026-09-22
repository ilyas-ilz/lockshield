"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, Upload, X, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/admin/api-client";
import { toast } from "sonner";
import { type PickedImage } from "./ImagePicker";

interface MediaItem {
  _id: string;
  url: string;
  publicId?: string;
  storage: "local" | "cloudinary";
  alt: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  createdAt: string;
}

interface PaginatedMedia {
  items: MediaItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function MediaModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (img: PickedImage) => void;
}) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // WHY the search goes to the server: this used to filter `items` in the
  // browser, which only ever saw the 18 assets on the current page — so
  // searching a 200-image library silently missed everything on pages 2+.
  // /api/media now filters on alt + url, so the query covers the whole
  // library and the result is paginated like any other listing.
  const fetchMedia = React.useCallback(
    async (targetPage = 1, query = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: "18",
          sort: "createdAt",
          order: "desc",
        });
        const trimmed = query.trim();
        if (trimmed) params.set("search", trimmed);

        const res = await api.get<PaginatedMedia>(`/api/media?${params}`);
        setItems(res.items || []);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch {
        // Ignore initial error if DB empty
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced so a keystroke does not fire a request per character; always
  // returns to page 1, since page 4 of the old result is meaningless once
  // the query changes.
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => void fetchMedia(1, search), 300);
    return () => clearTimeout(timer);
  }, [open, search, fetchMedia]);

  const handleUploadNew = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "media");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const uploaded = await res.json();
      const newMedia: PickedImage = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        storage: uploaded.storage,
        width: uploaded.width,
        height: uploaded.height,
        alt: uploaded.alt || "",
      };

      onSelect(newMedia);
      onOpenChange(false);
    } catch (err) {
      // WHY toast, not alert(): a native alert blocks the whole tab and, worse,
      // steals focus from this Radix dialog — dismissing it left the modal in a
      // half-closed state. The toast also survives the dialog closing.
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 max-h-[85vh] flex flex-col rounded-xl border border-app bg-surface shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-app px-5 py-4 bg-surface-2/40">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                Media Library
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-muted">
                Select an existing uploaded asset or upload a new file.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-app bg-surface">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted pointer-events-none" />
              <Input
                placeholder="Search by alt text or filename…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium cursor-pointer"
              >
                <Upload className="size-3.5 mr-1" />
                Upload from Device
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUploadNew(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-5 min-h-72">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted">
                <Loader2 className="size-8 animate-spin text-brand mb-2" />
                <p className="text-xs">Loading media assets…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted border-2 border-dashed border-app rounded-xl">
                <ImageIcon className="size-10 text-muted/50 mb-2" />
                {search.trim() ? (
                  <>
                    <p className="text-sm font-medium text-foreground">No assets match “{search.trim()}”</p>
                    <p className="text-xs text-muted mt-1">Searches alt text and filename across the whole library.</p>
                    <Button variant="secondary" size="sm" className="mt-3" onClick={() => setSearch("")}>
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">No media assets found</p>
                    <p className="text-xs text-muted mt-1">Upload an image to start building your library.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      onSelect({
                        url: item.url,
                        publicId: item.publicId,
                        storage: item.storage,
                        alt: item.alt,
                        width: item.width,
                        height: item.height,
                      });
                      onOpenChange(false);
                    }}
                    className="group relative flex flex-col rounded-lg border border-app bg-surface hover:border-brand hover:shadow-md transition-all overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-square bg-surface-2 relative overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt || "Media thumbnail"}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-brand text-white text-[11px] font-semibold px-2 py-1 rounded shadow-xs flex items-center gap-1">
                          <Check className="size-3" /> Select
                        </span>
                      </div>
                    </div>
                    <div className="p-2 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate" title={item.alt}>
                        {item.alt || "Untitled asset"}
                      </p>
                      <p className="text-[10px] text-muted truncate mt-0.5">
                        {item.width && item.height ? `${item.width}×${item.height}` : item.storage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-app px-5 py-3 bg-surface-2/40">
              <span className="text-xs text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => fetchMedia(page - 1, search)}
                  className="text-xs h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => fetchMedia(page + 1, search)}
                  className="text-xs h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
