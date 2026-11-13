import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

// The ui-sdk packages are linked from a checkout and ship TypeScript source.
// Dedupe keeps one React, since the linked packages resolve their own.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    // The registry's own import paths, as shadcn rewrites them on install.
    alias: { "@/registry": fileURLToPath(new URL("./registry", import.meta.url)) },
  },
  server: { fs: { allow: [".."] } },
})
