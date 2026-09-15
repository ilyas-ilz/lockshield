import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30000, // mongodb-memory-server's first download/boot can be slow
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
