import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache", "ui-ux-pro-max-skill-main"],
    globals: true,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
