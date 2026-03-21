import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Explicit host/port/hmr settings to avoid websocket connection issues in some environments
    // Bind to all interfaces so HMR works from different host resolutions (localhost/127.0.0.1)
    host: '0.0.0.0',
    port: 5173,
      // Fail if port 5173 is already in use so the dev server doesn't silently move to another port
      strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      // clientPort ensures the HMR client connects to the correct port when behind proxies
      clientPort: 5173
    },
    proxy: {
      "/api": {
        // default dev backend is localhost:3000
        target: process.env.API_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
        secure: false, // allow self-signed/HTTP for dev
        cookieDomainRewrite: "localhost", // ensure cookies work for localhost
      },
    },
  },
});
