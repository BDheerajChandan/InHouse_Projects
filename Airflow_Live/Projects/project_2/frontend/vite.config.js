// Projects/project_2/frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadProjectConfig() {
  const candidates = [
    resolve(__dirname, "../../project_config.json"),
    "/opt/airflow/Projects/project_config.json",
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

const projectConfig = loadProjectConfig();
const cfg           = projectConfig["project_2"];
const BACKEND_PORT  = cfg.backend.port;
const FRONTEND_PORT = cfg.frontend.port;

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: FRONTEND_PORT,
  },
  define: {
    __BACKEND_PORT__: BACKEND_PORT,
  },
});