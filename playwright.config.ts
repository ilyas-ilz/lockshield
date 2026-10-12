import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite (Chromium). `npm run test:e2e` boots the dev server itself;
 * an already-running `npm run dev` on :3000 is reused when present.
 * The default specs are read-only against the database. The write
 * round-trip (admin settings save) only runs with E2E_WRITE=1 plus
 * admin credentials, and restores the original value afterwards.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
