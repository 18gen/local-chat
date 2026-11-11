import { defineConfig } from "vitest/config";

// Tests cover logic, not components, so they need no browser environment.
export default defineConfig({
  // The "@/" imports, as tsconfig.json maps them.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
