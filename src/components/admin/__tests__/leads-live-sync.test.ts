import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const { pulseChange } = await import("../leads-live-sync");

const base = { newCount: 1, latestId: "a", latestName: "Eng salman" };

describe("pulseChange", () => {
  it("treats the first poll as a baseline, not a new lead", () => {
    expect(pulseChange(null, base)).toEqual({ newLead: false, refresh: false });
  });

  it("flags a new lead and refreshes when the newest lead changes", () => {
    expect(pulseChange(base, { newCount: 2, latestId: "b", latestName: "ilyas" })).toEqual({ newLead: true, refresh: true });
  });

  it("refreshes silently when only the 'new' count changes (status edited elsewhere)", () => {
    expect(pulseChange(base, { ...base, newCount: 0 })).toEqual({ newLead: false, refresh: true });
  });

  it("does nothing when nothing changed", () => {
    expect(pulseChange(base, { ...base })).toEqual({ newLead: false, refresh: false });
  });

  it("does not announce a 'new lead' when the newest one was deleted", () => {
    expect(pulseChange(base, { newCount: 0, latestId: null, latestName: null })).toEqual({ newLead: false, refresh: true });
  });
});
