import express from "express";
import cors from "cors";
import routesRouter from "./routes/routes.js";
import sosRouter from "./routes/sos.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "saferoute-ai-backend" });
});

app.use("/api/routes", routesRouter);
app.use("/api/sos", sosRouter);

app.listen(PORT, () => {
  console.log(`SafeRoute AI backend running on http://localhost:${PORT}`);
});
