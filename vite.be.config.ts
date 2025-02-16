import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: "[hash:base64:5]", // Ensure CSS class names are preserved
    },
    transformer: 'lightningcss'
  },
  build: {
    ssr: "backend/index.ts",
    outDir: path.resolve(__dirname, "dist-server"),
    target: "node23",
    rollupOptions: {
      external: [
        "express",
        "fs",
        "path",
        "dotenv",
        "vite",
        "bun", // Ensure Bun isn't bundled in case you still use it
      ],
      input: path.resolve(__dirname, "backend/index.ts"),
      output: {
        entryFileNames: "index.js",
        format: "esm", // Use ESM for consistency with modern runtimes
      },
    },
    minify: false, // Keep the server bundle readable
  },
});
