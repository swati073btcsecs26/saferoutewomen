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
        <pre
          style={{
            fontSize: 11,
            background: "#f7f5f2",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(data.recommended.breakdown, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function formatHour(hour) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${suffix}`;
}
