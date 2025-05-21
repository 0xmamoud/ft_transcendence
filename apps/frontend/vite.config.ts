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
    host: true,
    port: 3000,
    hmr: {
      timeout: 5000,
      protocol: "ws",
      overlay: false,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/ws": {
        target: "ws://localhost:3333",
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ""),
      },
    },
  },
});
