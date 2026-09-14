import { useState } from "react";
import { triggerSos } from "../api.js";

export default function SosPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSos() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await triggerSos({
        location: { lat: 28.5, lng: 77.4, label: "Current location (demo)" },
        trustedContacts: ["Mom", "Priya"],
      });
      setStatus({ ok: true, result });
    } catch (err) {
      setStatus({ ok: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Emergency &amp; trust layer</h2>
      <p className="muted">
        One tap shares your live location with trusted contacts. This demo calls the real
        backend endpoint and returns a mock confirmation.
      </p>
      <button className="btn-sos" onClick={handleSos} disabled={loading}>
        {loading ? "Sending..." : "SOS \u2014 Alert trusted contacts"}
      </button>

      {status?.ok && (
        <div className="sos-banner">
          Notified: {status.result.notified.join(", ")} at{" "}
          {new Date(status.result.timestamp).toLocaleTimeString()}
        </div>
      )}
      {status && !status.ok && <div className="error-banner">Could not reach backend: {status.error}</div>}
    </div>
  );
}
