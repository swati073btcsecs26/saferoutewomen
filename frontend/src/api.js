const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function searchRoutes(payload) {
  const res = await fetch(`${BASE_URL}/routes/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function triggerSos(payload) {
  const res = await fetch(`${BASE_URL}/sos/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
