import { describe, it, expect } from "vitest";
import { parseUploadResponse } from "../upload-response";

// Shape of a real POST /api/upload 201 body (captured from production).
const uploaded = {
  success: true,
  data: {
    _id: "6ad30051b704a8a504189d42",
    url: "https://cdn.lockshield.ae/lockshield/media/2026/10/DM1rfS4l1DIQRNbR.jpg",
    alt: "about four img 2",
    publicId: "lockshield/media/2026/10/DM1rfS4l1DIQRNbR.jpg",
    storage: "r2",
    width: 410,
    height: 348,
    format: "jpeg",
    bytes: 22019,
  },
};

describe("parseUploadResponse", () => {
  it("unwraps the { success, data } envelope into a picked image", () => {
    expect(parseUploadResponse(uploaded)).toEqual({
      url: "https://cdn.lockshield.ae/lockshield/media/2026/10/DM1rfS4l1DIQRNbR.jpg",
      publicId: "lockshield/media/2026/10/DM1rfS4l1DIQRNbR.jpg",
      storage: "r2",
      alt: "about four img 2",
      width: 410,
      height: 348,
    });
  });

  it("falls back to the given alt when the upload has none", () => {
    const body = { success: true, data: { ...uploaded.data, alt: "" } };
    expect(parseUploadResponse(body, "Kitchen hood").alt).toBe("Kitchen hood");
  });

  it("throws the server's error message for a failed upload", () => {
    expect(() => parseUploadResponse({ success: false, error: "File too large" })).toThrow("File too large");
  });

  it("throws instead of returning an image without a url", () => {
    expect(() => parseUploadResponse({ success: true, data: {} })).toThrow("Upload response had no file URL");
    expect(() => parseUploadResponse(null)).toThrow("Upload response had no file URL");
  });
});
