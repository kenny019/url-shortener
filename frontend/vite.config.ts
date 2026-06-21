import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Single-origin deploy: the backend serves this build from ./public.
    // emptyOutDir is required because the target is outside the Vite root.
    outDir: "../backend/public",
    emptyOutDir: true,
  },
});
