import { Router } from "express";
import { scoreRoute } from "../services/safetyScoring.js";

const router = Router();

// POST /api/routes/search
// body: { origin, destination, hour (0-23), riskPreference (0-1), candidates: [{ areaName, etaMinutes }] }
router.post("/search", (req, res) => {
  const { origin, destination, hour, riskPreference, candidates } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: "origin and destination are required" });
  }

  // In production `candidates` comes from Google Directions API / OSRM.
  // Here we accept them from the client, or fall back to a fixed demo set
  // so the endpoint is testable standalone (curl / Postman / no frontend).
  const routeCandidates = candidates?.length
    ? candidates
    : [
        { areaName: "market road", etaMinutes: 12 },
        { areaName: "outer ring lane", etaMinutes: 8 },
        { areaName: "college avenue", etaMinutes: 15 },
      ];

  const currentHour = Number.isInteger(hour) ? hour : new Date().getHours();
  const pref = typeof riskPreference === "number" ? riskPreference : 0.6;

  const scored = routeCandidates
    .map((c) => scoreRoute({ areaName: c.areaName, hour: currentHour, etaMinutes: c.etaMinutes, riskPreference: pref }))
    .sort((a, b) => b.rankingScore - a.rankingScore);

  res.json({
    origin,
    destination,
    hour: currentHour,
    riskPreference: pref,
    recommended: scored[0],
    routes: scored,
  });
});

export default router;
