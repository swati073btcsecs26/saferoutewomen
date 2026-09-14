// In production this data is fetched from:
//  - open crime/incident datasets (e.g. NCRB, city open-data portals)
//  - OpenStreetMap tags (streetlight density, footpath type)
//  - live population-density / footfall APIs
//  - Google Maps Directions API (for the actual route geometry)
//
// For this hackathon build, each named area carries pre-computed
// context features so the scoring engine has something real to work on.

export const AREA_CONTEXT = {
  default: {
    lightingScore: 0.6, // 0-1, higher = better lit
    crowdDensity: 0.5, // 0-1, higher = busier
    incidentRate: 0.3, // 0-1, higher = more historical incidents
    distanceToSafePointKm: 0.8, // police station / hospital / open shop
  },
  "market road": {
    lightingScore: 0.85,
    crowdDensity: 0.9,
    incidentRate: 0.15,
    distanceToSafePointKm: 0.2,
  },
  "outer ring lane": {
    lightingScore: 0.25,
    crowdDensity: 0.15,
    incidentRate: 0.65,
    distanceToSafePointKm: 1.9,
  },
  "college avenue": {
    lightingScore: 0.7,
    crowdDensity: 0.6,
    incidentRate: 0.25,
    distanceToSafePointKm: 0.5,
  },
  "riverside path": {
    lightingScore: 0.2,
    crowdDensity: 0.1,
    incidentRate: 0.55,
    distanceToSafePointKm: 2.4,
  },
};

export function lookupAreaContext(name = "") {
  const key = name.trim().toLowerCase();
  return AREA_CONTEXT[key] || AREA_CONTEXT.default;
}
