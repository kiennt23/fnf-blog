import { defineConfig } from "vite";
import path from "path";
import defaultConfig from "./vite.common.config";

export default defineConfig({
  css: defaultConfig.css,
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
        "bun",
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
