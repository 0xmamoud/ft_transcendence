import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      timeout: 5000,
      protocol: "ws",
      overlay: false,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
