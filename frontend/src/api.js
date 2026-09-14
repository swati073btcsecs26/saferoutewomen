import { searchRoutesLocally, triggerSosLocally } from "./localScoring.js";

// If VITE_API_URL is set (e.g. your Render backend), calls go there.
// Otherwise (e.g. the static GitHub Pages build, which has no backend),
// the app falls back to identical scoring logic running in the browser.
const BASE_URL = import.meta.env.VITE_API_URL || null;

export async function searchRoutes(payload) {
  if (!BASE_URL) return searchRoutesLocally(payload);

  try {
    const res = await fetch(`${BASE_URL}/routes/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend unreachable, using local scoring fallback:", err.message);
    return searchRoutesLocally(payload);
  }
}

export async function triggerSos(payload) {
  if (!BASE_URL) return triggerSosLocally(payload);

  try {
    const res = await fetch(`${BASE_URL}/sos/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend unreachable, using local SOS fallback:", err.message);
    return triggerSosLocally(payload);
  }
}
