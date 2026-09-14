import { useState } from "react";

const AREA_OPTIONS = ["market road", "outer ring lane", "college avenue", "riverside path"];

export default function RouteForm({ onSearch, loading }) {
  const [origin, setOrigin] = useState("Home");
  const [destination, setDestination] = useState("College");
  const [hour, setHour] = useState(new Date().getHours());
  const [riskPreference, setRiskPreference] = useState(0.6);
  const [selectedAreas, setSelectedAreas] = useState(AREA_OPTIONS.slice(0, 3));

  function toggleArea(area) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const candidates = selectedAreas.map((areaName, i) => ({
      areaName,
      etaMinutes: 8 + i * 4, // demo ETAs; a real build reads these from Maps API
    }));
    onSearch({ origin, destination, hour: Number(hour), riskPreference, candidates });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Plan your journey</h2>
      <p className="muted">Enter where you're going — SafeRoute AI scores every candidate path.</p>

      <label htmlFor="origin">Origin</label>
      <input id="origin" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />

      <label htmlFor="destination">Destination</label>
      <input
        id="destination"
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <label htmlFor="hour">Travel time (hour of day, 0-23)</label>
      <input
        id="hour"
        type="number"
        min="0"
        max="23"
        value={hour}
        onChange={(e) => setHour(e.target.value)}
      />

      <label htmlFor="risk">
        Prioritize: Speed &nbsp;&mdash;&nbsp; Safety ({Math.round(riskPreference * 100)}% safety weight)
      </label>
      <input
        id="risk"
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={riskPreference}
        onChange={(e) => setRiskPreference(Number(e.target.value))}
      />

      <label>Candidate route areas (demo dataset)</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {AREA_OPTIONS.map((area) => (
          <button
            type="button"
            key={area}
            onClick={() => toggleArea(area)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: selectedAreas.includes(area) ? "var(--navy)" : "var(--white)",
              color: selectedAreas.includes(area) ? "var(--white)" : "var(--navy)",
              cursor: "pointer",
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            {area}
          </button>
        ))}
      </div>

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Scoring routes..." : "Find safest route"}
      </button>
    </form>
  );
}
