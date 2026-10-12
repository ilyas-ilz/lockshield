import { test, expect } from "@playwright/test";

/**
 * Admin auth behaviour + regression guard for the fixed SEO blocker:
 * an address-only settings save must not be rejected by an unrelated
 * defaultSeo validation error (previously a stale 78-char title in the
 * DB rejected every save with "at most 70 characters").
 */
test.describe("admin auth guards", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    // PasswordInput renders an extra labelled node, so the id selector
    // is the precise handle here.
    await expect(page.locator("#password")).toBeVisible();
  });

  test("wrong credentials show an error, no redirect", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email address").fill("nobody@lockshield.ae");
    await page.locator("#password").fill("wrong-password-123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Incorrect email or password.");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated /admin/settings redirects to login", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin\/login\?callbackUrl=%2Fadmin%2Fsettings/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("unauthenticated new-post page redirects to login", async ({ page }) => {
    await page.goto("/admin/posts/new");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("admin settings save (write, opt-in)", () => {
  test.skip(
    !process.env.E2E_WRITE || !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Set E2E_WRITE=1, E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the mutating round-trip."
  );

  test("address-only save succeeds and survives reload", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL!;
    const password = process.env.E2E_ADMIN_PASSWORD!;

    await page.goto("/admin/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).not.toHaveURL(/\/admin\/login/);

    await page.goto("/admin/settings");
    await page.getByRole("button", { name: "Contact & NAP Details" }).click();
    const street = page.getByLabel("Street Address");
    await expect(street).toBeVisible();
    const original = await street.inputValue();

    // Suffix-restore round-trip so the suite leaves no junk behind.
    const probe = `${original} E2E`.trim();
    await street.fill(probe);
    await page.getByRole("button", { name: /save all settings/i }).click();
    await expect(page.getByText("Settings updated successfully")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: "Contact & NAP Details" }).click();
    await expect(page.getByLabel("Street Address")).toHaveValue(probe);

    await page.getByLabel("Street Address").fill(original);
    await page.getByRole("button", { name: /save all settings/i }).click();
    await expect(page.getByText("Settings updated successfully")).toBeVisible();
  });
});
