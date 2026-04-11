// Projects/project_1/frontend/vite.config.js
//
// Reads project_config.json at build/dev time and injects __BACKEND_PORT__
// as a global constant — so services/config.js can bootstrap without .env.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { resolve } from "path";

// Walk up to find project_config.json (works both locally and in Docker)
function loadProjectConfig() {
  const candidates = [
    resolve(__dirname, "../../project_config.json"),          // local Windows path
    "/opt/airflow/Projects/project_config.json",              // Docker path
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, "utf-8"));
    } catch {
      // try next
    }
  }
  throw new Error("project_config.json not found");
}

const projectConfig  = loadProjectConfig();
const cfg            = projectConfig["project_1"];
const BACKEND_PORT   = cfg.backend.port;
const FRONTEND_PORT  = cfg.frontend.port;

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: FRONTEND_PORT,   // dev server uses JSON port — change JSON, port changes
  },
  define: {
    // Injected as a global at build time — no .env file needed
    __BACKEND_PORT__: BACKEND_PORT,
  },
});