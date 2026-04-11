// Projects/project_1/frontend/services/config.js
//
// Single source of truth for API base URL.
// Fetches live config from the backend /config endpoint so this file
// never needs to change — port comes from project_config.json via backend.
//
// USAGE (in any component):
//   import { getConfig } from '../../services/config.js';
//   const { apiBase } = await getConfig();

const FALLBACK_PORT = 8001; // only used if backend is unreachable during dev

let _cache = null;

export async function getConfig() {
  if (_cache) return _cache;

  // The backend port is the one thing we must know upfront.
  // We derive it from the current page's hostname and try the default port,
  // OR you can set VITE_BACKEND_PORT in vite.config.js via define (build-time).
  const backendPort =
    typeof __BACKEND_PORT__ !== "undefined"
      ? __BACKEND_PORT__
      : FALLBACK_PORT;

  const backendBase = `http://localhost:${backendPort}`;

  try {
    const res  = await fetch(`${backendBase}/config`);
    const data = await res.json();
    _cache = {
      apiBase:       `http://${data.backendHost}:${data.backendPort}`,
      projectName:   data.projectName,
      frontendPort:  data.frontendPort,
    };
  } catch {
    // Fallback for local dev without DAG
    _cache = {
      apiBase:      backendBase,
      projectName:  "Project Alpha",
      frontendPort: 3002,
    };
  }

  return _cache;
}