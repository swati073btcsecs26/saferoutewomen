import { Router } from "express";

const router = Router();

// In production this would push notifications (FCM/Twilio) to trusted
// contacts with a live-location deep link. Mocked here for the demo.
router.post("/trigger", (req, res) => {
  const { userId, location, trustedContacts = [] } = req.body;

  if (!location) {
    return res.status(400).json({ error: "location is required" });
  }

  res.json({
    status: "sent",
    userId: userId || "demo-user",
    notified: trustedContacts.length ? trustedContacts : ["Mom", "Priya"],
    location,
    timestamp: new Date().toISOString(),
  });
});

export default router;
