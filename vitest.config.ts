import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30000, // mongodb-memory-server's first download/boot can be slow
    // next-auth imports "next/server" without an extension, which Node's ESM
    // loader rejects; inlining lets Vite resolve it, so middleware tests can
    // run the real Auth.js wrapper instead of a mock.
    server: { deps: { inline: ["next-auth"] } },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
