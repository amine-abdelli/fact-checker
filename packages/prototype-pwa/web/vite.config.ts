import path from "node:path";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

// http://localhost is a secure context, so getUserMedia works there without TLS — plain
// HTTP by default, which also keeps the WebSocket to the FastAPI server on plain ws://
// (see src/App.tsx). Set VITE_HTTPS=1 only when testing from a phone over LAN, where
// getUserMedia requires HTTPS on a non-localhost host (see packages/prototype-pwa/README.md);
// the backend has no TLS of its own, so LAN testing needs a reverse proxy or a second cert
// on the FastAPI side — not needed for local-only use.
const useHttps = process.env.VITE_HTTPS === "1";

export default defineConfig({
  plugins: [react(), ...(useHttps ? [basicSsl()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    https: useHttps,
  },
});
