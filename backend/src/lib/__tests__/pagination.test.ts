import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Schema, model } from "mongoose";
import { startTestDB, stopTestDB, clearTestDB } from "../../tests/mongo-test-helper";
import { paginate } from "../pagination";

interface IWidget {
  name: string;
  n: number;
}
const Widget = model<IWidget>("Widget", new Schema<IWidget>({ name: String, n: Number }));

describe("paginate", () => {
  beforeAll(startTestDB);
  afterAll(stopTestDB);
  beforeEach(clearTestDB);

  async function seed(count: number) {
    await Widget.insertMany(Array.from({ length: count }, (_, i) => ({ name: `widget-${i}`, n: i })));
  }

  it("returns the first page with correct total/totalPages", async () => {
    await seed(25);
    const result = await paginate(Widget, {}, { page: 1, limit: 10, sort: { n: 1 } });
    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.hasPrevPage).toBe(false);
    expect(result.hasNextPage).toBe(true);
    expect((result.items[0] as unknown as IWidget).n).toBe(0);
  });

  it("returns the last (partial) page correctly", async () => {
    await seed(25);
    const result = await paginate(Widget, {}, { page: 3, limit: 10, sort: { n: 1 } });
    expect(result.items).toHaveLength(5);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
  });

  it("returns an empty page (not an error) past the last page", async () => {
    await seed(5);
    const result = await paginate(Widget, {}, { page: 99, limit: 10 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(5);
  });

  it("clamps pageSize to the 100 ceiling", async () => {
    await seed(120);
    const result = await paginate(Widget, {}, { page: 1, pageSize: 10000 });
    expect(result.pageSize).toBe(100);
    expect(result.items).toHaveLength(100);
  });

  it("still honours the legacy `limit` option as an alias of pageSize", async () => {
    await seed(30);
    const result = await paginate(Widget, {}, { page: 1, limit: 10 });
    expect(result.pageSize).toBe(10);
    expect(result.limit).toBe(10);
    expect(result.items).toHaveLength(10);
  });

  it("applies the filter, not just pagination math", async () => {
    await seed(10);
    const result = await paginate(Widget, { n: { $gte: 5 } }, { page: 1, limit: 20 });
    expect(result.total).toBe(5);
  });
});
