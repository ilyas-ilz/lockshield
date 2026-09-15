// WHY: form field names use dot paths ("seo.title", "address.street") to
// target nested object fields with the same flat FieldConfig list used for
// top-level fields — these two helpers read/write a path immutably so
// <ResourceForm> can stay a single flat `formData` state object regardless
// of how deep a field lives in the underlying document.

export function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result: Record<string, unknown> = { ...obj };
  let cursor = result;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      cursor[key] = value;
    } else {
      const next = cursor[key];
      cursor[key] = next && typeof next === "object" ? { ...(next as Record<string, unknown>) } : {};
      cursor = cursor[key] as Record<string, unknown>;
    }
  });
  return result;
}
