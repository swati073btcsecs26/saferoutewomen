export default function RouteResults({ data }) {
  if (!data) return null;

  return (
    <div className="card">
      <h2>Route options</h2>
      <p className="muted">
        Ranked for {data.origin} &rarr; {data.destination} at {formatHour(data.hour)}, weighted{" "}
        {Math.round(data.riskPreference * 100)}% toward safety.
      </p>

      {data.routes.map((r) => {
        const isTop = r === data.recommended;
        return (
          <div key={r.areaName} className={`route-row ${isTop ? "recommended" : ""}`}>
            <div>
              <div style={{ fontWeight: 700, textTransform: "capitalize" }}>
                {r.areaName} &mdash; {r.etaMinutes} min
                {isTop && <span className="badge">RECOMMENDED</span>}
              </div>
              <div className="meta">
                Safety {r.safetyScore}/100 &middot; Speed {r.speedScore}/100
              </div>
            </div>
            <div className="score-pill">{r.rankingScore}</div>
          </div>
        );
      })}

      <details style={{ marginTop: 12 }}>
        <summary className="muted" style={{ cursor: "pointer" }}>
          Why this ranking? (feature breakdown)
        </summary>
        <BreakdownPanel breakdown={data.recommended.breakdown} areaName={data.recommended.areaName} />
      </details>
    </div>
  );
}

const FACTORS = [
  {
    key: "lighting",
    label: "Street lighting",
    hint: "Higher is better lit",
    format: (v) => `${Math.round(v * 100)}%`,
    percent: (v) => v * 100,
    color: "var(--gold)",
  },
  {
    key: "crowdDensity",
    label: "Crowd / footfall",
    hint: "Higher means busier, safer streets",
    format: (v) => `${Math.round(v * 100)}%`,
    percent: (v) => v * 100,
    color: "var(--coral)",
  },
  {
    key: "incidentRate",
    label: "Historical incident rate",
    hint: "Lower is safer",
    format: (v) => `${Math.round(v * 100)}%`,
    percent: (v) => v * 100,
    color: "#b23a3a",
    invert: true,
  },
  {
    key: "timeFactor",
    label: "Time-of-day safety",
    hint: "Reflects how risky this hour is",
    format: (v) => `${Math.round(v * 100)}%`,
    percent: (v) => v * 100,
    color: "var(--navy)",
  },
];

function BreakdownPanel({ breakdown, areaName }) {
  return (
    <div
      style={{
        marginTop: 10,
        background: "#fbfaf8",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, textTransform: "capitalize" }}>
        Feature scores used for <strong style={{ color: "var(--navy)" }}>{areaName}</strong>
      </div>

      {FACTORS.map((f) => {
        const value = breakdown[f.key];
        const pct = Math.max(0, Math.min(100, f.percent(value)));
        return (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: "var(--navy)" }}>{f.label}</span>
              <span style={{ color: "var(--muted)" }}>{f.format(value)}</span>
            </div>
            <div
              style={{
                height: 7,
                borderRadius: 6,
                background: "#e9e6e0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: f.color,
                  borderRadius: 6,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{f.hint}</div>
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
        <span style={{ fontWeight: 600, color: "var(--navy)" }}>Distance to nearest safe point</span>
        <span style={{ color: "var(--muted)" }}>{breakdown.distanceToSafePointKm.toFixed(1)} km</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
        Police station, hospital, or open shop &mdash; closer is safer
      </div>
    </div>
  );
}

function formatHour(hour) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${suffix}`;
}
