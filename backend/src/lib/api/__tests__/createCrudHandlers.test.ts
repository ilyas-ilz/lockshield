import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { Schema, model, type Document } from "mongoose";
import { z } from "zod";
import { NextRequest } from "next/server";
import { startTestDB, stopTestDB, clearTestDB } from "../../../tests/mongo-test-helper";
import { createCollectionHandlers, createItemHandlers } from "../createCrudHandlers";

// WHY mock only the NextAuth session lookup (lib/auth's `auth()`), not
// lib/rbac itself: this way the REAL requireRole/requireSession — the
// actual role-membership check ("is EDITOR in writeRoles?"), the actual
// 401-vs-403 branching — runs for real in this test. Only the "what does
// the session cookie say" part is faked, which is the minimum needed to
// avoid booting a real NextAuth session in a unit test.
let currentActor: { id: string; role: "ADMIN" | "EDITOR"; email: string } | null = {
  id: "actor1",
  role: "ADMIN",
  email: "admin@test.com",
};

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (currentActor ? { user: currentActor } : null)),
}));

interface IWidget extends Document {
  name: string;
  qty: number;
}
const WidgetModel = model<IWidget>("CrudWidget", new Schema<IWidget>({ name: String, qty: Number }, { timestamps: true }));

const createSchema = z.object({ name: z.string().min(1), qty: z.number().int().default(0) });
const updateSchema = createSchema.partial();

const { GET: listGET, POST: listPOST } = createCollectionHandlers({
  resourceName: "Widget",
  model: WidgetModel,
  createSchema,
  updateSchema,
  readRoles: ["ADMIN", "EDITOR"],
  writeRoles: ["ADMIN"],
  searchFields: ["name"],
});
const { GET: itemGET, PATCH: itemPATCH, DELETE: itemDELETE } = createItemHandlers({
  resourceName: "Widget",
  model: WidgetModel,
  createSchema,
  updateSchema,
  readRoles: ["ADMIN", "EDITOR"],
  writeRoles: ["ADMIN"],
});

// WHY a narrow local init type, not the DOM lib's RequestInit: NextRequest's
// own RequestInit disagrees with lib.dom's on `signal`'s nullability, and
// tests here only ever need method/body anyway.
function req(url: string, init?: { method?: string; body?: string }) {
  return new NextRequest(new URL(url, "http://localhost"), init);
}

describe("CRUD factory (via Widget)", () => {
  beforeAll(startTestDB);
  afterAll(stopTestDB);
  beforeEach(() => {
    currentActor = { id: "actor1", role: "ADMIN", email: "admin@test.com" };
    return clearTestDB();
  });

  it("creates a document and persists it", async () => {
    const res = await listPOST(req("/api/widgets", { method: "POST", body: JSON.stringify({ name: "Hammer", qty: 3 }) }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe("Hammer");
    expect(await WidgetModel.countDocuments()).toBe(1);
  });

  it("rejects an invalid create payload with 400", async () => {
    const res = await listPOST(req("/api/widgets", { method: "POST", body: JSON.stringify({ qty: 3 }) })); // missing required name
    expect(res.status).toBe(400);
    expect(await WidgetModel.countDocuments()).toBe(0);
  });

  it("rejects writes from a role not in writeRoles", async () => {
    currentActor = { id: "editor1", role: "EDITOR", email: "editor@test.com" };
    const res = await listPOST(req("/api/widgets", { method: "POST", body: JSON.stringify({ name: "Nope" }) }));
    expect(res.status).toBe(403);
  });

  it("rejects unauthenticated requests with 401", async () => {
    currentActor = null;
    const res = await listGET(req("/api/widgets"));
    expect(res.status).toBe(401);
  });

  it("paginates the list endpoint", async () => {
    await WidgetModel.insertMany(Array.from({ length: 15 }, (_, i) => ({ name: `W${i}`, qty: i })));
    const res = await listGET(req("/api/widgets?page=2&limit=10"));
    const body = await res.json();
    expect(body.data.items).toHaveLength(5);
    expect(body.data.page).toBe(2);
    expect(body.data.total).toBe(15);
  });

  it("searches via ?q= across configured searchFields", async () => {
    await WidgetModel.create({ name: "Red Hammer", qty: 1 });
    await WidgetModel.create({ name: "Blue Wrench", qty: 1 });
    const res = await listGET(req("/api/widgets?q=hammer"));
    const body = await res.json();
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].name).toBe("Red Hammer");
  });

  it("escapes regex metacharacters in ?q= instead of treating them as regex", async () => {
    await WidgetModel.create({ name: "a.b", qty: 1 });
    await WidgetModel.create({ name: "axb", qty: 1 }); // would also match /a.b/ if the dot were treated as regex-any
    const res = await listGET(req("/api/widgets?q=a.b"));
    const body = await res.json();
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].name).toBe("a.b");
  });

  it("gets, updates, and deletes a single item by id", async () => {
    const doc = await WidgetModel.create({ name: "Original", qty: 1 });
    const id = doc._id.toString();

    const got = await itemGET(req(`/api/widgets/${id}`), { params: Promise.resolve({ id }) });
    expect((await got.json()).data.name).toBe("Original");

    const patched = await itemPATCH(req(`/api/widgets/${id}`, { method: "PATCH", body: JSON.stringify({ name: "Renamed" }) }), {
      params: Promise.resolve({ id }),
    });
    expect((await patched.json()).data.name).toBe("Renamed");

    const deleted = await itemDELETE(req(`/api/widgets/${id}`, { method: "DELETE" }), { params: Promise.resolve({ id }) });
    expect(deleted.status).toBe(204);
    expect(await WidgetModel.findById(id)).toBeNull();
  });

  it("returns 404 for a well-formed but nonexistent id", async () => {
    const res = await itemGET(req("/api/widgets/507f1f77bcf86cd799439011"), {
      params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 (not 500) for a malformed id", async () => {
    const res = await itemGET(req("/api/widgets/not-an-id"), { params: Promise.resolve({ id: "not-an-id" }) });
    expect(res.status).toBe(400);
  });
});
