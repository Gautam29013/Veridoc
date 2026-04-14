import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // same as 0.0.0.0
    port: 5173,
    allowedHosts: ["veridoc.varun.page"],
    protocol: "wss",
    clientPort: 443,
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (apiPath) => apiPath.replace(/^\/api/, ""),
      },
    },
    // dev-only: allow everything
    // allowedHosts: 'all',
  },
});
