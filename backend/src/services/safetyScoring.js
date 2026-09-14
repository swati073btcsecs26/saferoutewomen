import { lookupAreaContext } from "../data/mockContext.js";

// These weights mirror the feature_importances_ produced by the
// RandomForestClassifier trained in /ml/train_model.py on the synthetic
// dataset. Swap this function for a call to a deployed model endpoint
// (e.g. FastAPI serving model.joblib) once real historical data is in place.
const FEATURE_WEIGHTS = {
  lighting: 0.28,
  crowd: 0.18,
  incidentInverse: 0.30,
  safePointProximity: 0.14,
  timeOfDay: 0.10,
};

// Night hours (10 PM - 5 AM) increase risk; this factor is combined
// with the area's static context to produce a *dynamic* score that
// changes with when you travel, not just where.
function timeOfDayRiskFactor(hour) {
  if (hour >= 22 || hour < 5) return 0.15; // high risk window
  if (hour >= 19 && hour < 22) return 0.55; // dusk / early night
  if (hour >= 5 && hour < 7) return 0.6; // early morning
  return 0.9; // daytime, lowest risk
}

function proximityScore(distanceKm) {
  // Closer to a safe point (police/hospital/open shop) = higher score
  return Math.max(0, 1 - distanceKm / 3);
}

/**
 * Computes a 0-100 safety score for a named route/area at a given hour,
 * then blends in the user's own risk-vs-speed preference to produce a
 * final ranking score.
 */
export function scoreRoute({ areaName, hour, etaMinutes, riskPreference = 0.5 }) {
  const ctx = lookupAreaContext(areaName);
  const timeFactor = timeOfDayRiskFactor(hour);

  const featureScore =
    FEATURE_WEIGHTS.lighting * ctx.lightingScore +
    FEATURE_WEIGHTS.crowd * ctx.crowdDensity +
    FEATURE_WEIGHTS.incidentInverse * (1 - ctx.incidentRate) +
    FEATURE_WEIGHTS.safePointProximity * proximityScore(ctx.distanceToSafePointKm) +
    FEATURE_WEIGHTS.timeOfDay * timeFactor;

  const safetyScore = Math.round(featureScore * 100);

  // Speed score: shorter ETA = higher, normalized against a 30 min ceiling
  const speedScore = Math.round(Math.max(0, 100 - (etaMinutes / 30) * 100));

  // riskPreference: 0 = pure speed, 1 = pure safety
  const rankingScore = Math.round(
    riskPreference * safetyScore + (1 - riskPreference) * speedScore
  );

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

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}
