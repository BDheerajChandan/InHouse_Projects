// Projects/project_2/frontend/services/config.js
const FALLBACK_PORT = 8002;

let _cache = null;

export async function getConfig() {
  if (_cache) return _cache;

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
    _cache = {
      apiBase:      backendBase,
      projectName:  "Project Beta",
      frontendPort: 3003,
    };
  }

  return _cache;
}