// Client-side mirror of backend/src/services/safetyScoring.js + data/mockContext.js
// so the app can run as a fully static site (GitHub Pages, no backend needed).

const AREA_CONTEXT = {
  default: { lightingScore: 0.6, crowdDensity: 0.5, incidentRate: 0.3, distanceToSafePointKm: 0.8 },
  "market road": { lightingScore: 0.85, crowdDensity: 0.9, incidentRate: 0.15, distanceToSafePointKm: 0.2 },
  "outer ring lane": { lightingScore: 0.25, crowdDensity: 0.15, incidentRate: 0.65, distanceToSafePointKm: 1.9 },
  "college avenue": { lightingScore: 0.7, crowdDensity: 0.6, incidentRate: 0.25, distanceToSafePointKm: 0.5 },
  "riverside path": { lightingScore: 0.2, crowdDensity: 0.1, incidentRate: 0.55, distanceToSafePointKm: 2.4 },
};

const FEATURE_WEIGHTS = {
  lighting: 0.28,
  crowd: 0.18,
  incidentInverse: 0.3,
  safePointProximity: 0.14,
  timeOfDay: 0.1,
};

function lookupAreaContext(name = "") {
  const key = name.trim().toLowerCase();
  return AREA_CONTEXT[key] || AREA_CONTEXT.default;
}

function timeOfDayRiskFactor(hour) {
  if (hour >= 22 || hour < 5) return 0.15;
  if (hour >= 19 && hour < 22) return 0.55;
  if (hour >= 5 && hour < 7) return 0.6;
  return 0.9;
}

function proximityScore(distanceKm) {
  return Math.max(0, 1 - distanceKm / 3);
}

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function scoreRoute({ areaName, hour, etaMinutes, riskPreference = 0.5 }) {
  const ctx = lookupAreaContext(areaName);
  const timeFactor = timeOfDayRiskFactor(hour);

  const featureScore =
    FEATURE_WEIGHTS.lighting * ctx.lightingScore +
    FEATURE_WEIGHTS.crowd * ctx.crowdDensity +
    FEATURE_WEIGHTS.incidentInverse * (1 - ctx.incidentRate) +
    FEATURE_WEIGHTS.safePointProximity * proximityScore(ctx.distanceToSafePointKm) +
    FEATURE_WEIGHTS.timeOfDay * timeFactor;

  const safetyScore = Math.round(featureScore * 100);
  const speedScore = Math.round(Math.max(0, 100 - (etaMinutes / 30) * 100));
  const rankingScore = Math.round(riskPreference * safetyScore + (1 - riskPreference) * speedScore);

  return {
    areaName,
    etaMinutes,
    safetyScore: clamp(safetyScore),
    speedScore: clamp(speedScore),
    rankingScore: clamp(rankingScore),
    breakdown: {
      lighting: ctx.lightingScore,
      crowdDensity: ctx.crowdDensity,
      incidentRate: ctx.incidentRate,
      distanceToSafePointKm: ctx.distanceToSafePointKm,
      timeFactor,
    },
  };
}

export function searchRoutesLocally({ origin, destination, hour, riskPreference, candidates }) {
  const currentHour = Number.isInteger(hour) ? hour : new Date().getHours();
  const pref = typeof riskPreference === "number" ? riskPreference : 0.6;

  const scored = candidates
    .map((c) => scoreRoute({ areaName: c.areaName, hour: currentHour, etaMinutes: c.etaMinutes, riskPreference: pref }))
    .sort((a, b) => b.rankingScore - a.rankingScore);

  return {
    origin,
    destination,
    hour: currentHour,
    riskPreference: pref,
    recommended: scored[0],
    routes: scored,
  };
}

export function triggerSosLocally({ location, trustedContacts = [] }) {
  return Promise.resolve({
    status: "sent",
    notified: trustedContacts.length ? trustedContacts : ["Mom", "Priya"],
    location,
    timestamp: new Date().toISOString(),
  });
}
