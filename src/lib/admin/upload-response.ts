import type { PickedImage } from "@/components/admin/fields/ImagePicker";

interface UploadEnvelope {
  success?: boolean;
  error?: string;
  data?: Partial<PickedImage>;
}

/**
 * Turns a POST /api/upload response body into the image a picker stores.
 *
 * WHY: the route answers with the shared { success, data } envelope
 * (lib/http.ts), but both upload widgets read `url` off the top level. They
 * got undefined, stored an image with no URL and showed the empty drop zone
 * again, so "Upload from Device" looked like it did nothing even though the
 * file had reached R2 and the Media library.
 */
export function parseUploadResponse(body: unknown, fallbackAlt = ""): PickedImage {
  const envelope = (body ?? {}) as UploadEnvelope;
  if (envelope.success === false) throw new Error(envelope.error || "Upload failed");

  const data = envelope.data;
  if (!data?.url) throw new Error("Upload response had no file URL");

  return {
    url: data.url,
    publicId: data.publicId,
    storage: data.storage,
    alt: data.alt || fallbackAlt,
    width: data.width,
    height: data.height,
  };
}
