import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Use esbuild's automatic JSX runtime directly instead of
  // @vitejs/plugin-react (v6 requires Vite 8, but vitest 3.x uses Vite 6).
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["src/test-setup.ts"],
    env: {
      ADMIN_API_KEY: "dev-admin-key",
      INGEST_API_KEY: "dev-ingest-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
