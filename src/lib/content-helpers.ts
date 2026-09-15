import { nanoid } from "nanoid";

/** New content gets a fresh translationGroupId; editing keeps the existing one so a future locale variant can link back to it. */
export function ensureTranslationGroupId(existing?: string): string {
  return existing && existing.length > 0 ? existing : nanoid(12);
}

/**
 * Reading time estimate from a Tiptap JSON doc, ~200 wpm (average adult
 * silent reading speed). Walks the doc tree collecting `text` node content;
 * unknown/malformed input degrades to a 1-minute floor rather than throwing
 * — this only feeds a "3 min read" label, never a hard requirement.
 */
export function estimateReadingTimeMinutes(tiptapDoc: unknown): number {
  const words = countWords(tiptapDoc);
  return Math.max(1, Math.round(words / 200));
}

function countWords(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const obj = node as { text?: unknown; content?: unknown };
  let count = 0;
  if (typeof obj.text === "string") {
    count += obj.text.trim().split(/\s+/).filter(Boolean).length;
  }
  if (Array.isArray(obj.content)) {
    for (const child of obj.content) count += countWords(child);
  }
  return count;
}
