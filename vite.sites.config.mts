import { defineConfig } from "vite";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig({
  plugins: [sites()],
  build: {
    ssr: "sites/worker.ts",
    outDir: "dist/server",
    rollupOptions: { output: { entryFileNames: "index.js", format: "es" } },
  },
});
