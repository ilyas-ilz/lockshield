import { test, expect } from "@playwright/test";

/**
 * Read-only proof that public pages render live MongoDB data
 * (admin Settings -> landing/contact), not frozen build output.
 * The LocalBusiness JSON-LD block is only emitted when getSettings()
 * succeeds, so its content doubles as a DB-connectivity assertion.
 */
test.describe("public pages render live settings data", () => {
  test("homepage emits LocalBusiness JSON-LD with the DB street address", async ({ page }) => {
    await page.goto("/");
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts.first()).toBeAttached();
    const bodies = await scripts.allInnerTexts();
    const localBusiness = bodies.find((b) => b.includes('"LocalBusiness"'));
    expect(localBusiness, "LocalBusiness JSON-LD block missing — settings/DB read failed").toBeDefined();
    expect(localBusiness).toContain("Hor Al Anz");
  });

  test("homepage shows services teaser", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "View All Services" })).toBeVisible();
    // The expanding grid keeps collapsed panels in the DOM hidden, so
    // filter to the visible (expanded) instance.
    await expect(page.getByText("Annual Maintenance Contract").filter({ visible: true }).first()).toBeVisible();
  });

  test("contact page shows the DB address and PO box", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText("P.O. Box 47672")).toBeVisible();
    await expect(page.getByRole("main").getByText(/Hor Al Anz/).first()).toBeVisible();
  });
});
