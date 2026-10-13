import { test, expect } from "@playwright/test";

/**
 * The home hero is position: sticky, so it stays pinned behind .page-body for
 * the whole page. Its slideshow, Ken Burns zoom and GSAP parallax kept running
 * underneath, which dropped scroll frames to ~33ms and made the page flicker
 * while images were still loading. Once fully covered it must stop painting,
 * and it must come back when the visitor scrolls up.
 */
test.describe("home hero behind the page body", () => {
  test("hides and pauses once covered, returns at the top", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator(".hero-pin");
    await expect(hero).toBeVisible();
    await expect(hero).not.toHaveAttribute("data-covered");

    const heroHeight = await hero.evaluate((el) => el.getBoundingClientRect().height);
    await page.evaluate((y) => window.scrollTo(0, y), heroHeight + 400);
    await expect(hero).toHaveAttribute("data-covered", "");
    await expect(hero).toHaveCSS("visibility", "hidden");

    const runningHeroAnimations = await hero.evaluate(
      (el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length
    );
    expect(runningHeroAnimations).toBe(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(hero).not.toHaveAttribute("data-covered");
    await expect(hero).toHaveCSS("visibility", "visible");
  });
});
