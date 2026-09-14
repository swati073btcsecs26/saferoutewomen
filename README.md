# SafeRoute AI

**AI/ML for Context-Aware Women's Travel Recommendations**
*The fastest route is not always the right route.*

A working prototype that scores candidate travel routes on **safety**, not just speed — combining time-of-day, historical incident data, lighting, crowd density, and proximity to safe points, then re-ranking against the user's own risk preference.

---

## Folder structure

```
saferoute-ai/
├── frontend/          React + Vite app (route form, results, SOS panel)
│   └── src/
│       ├── components/
│       ├── styles/
│       ├── api.js
│       └── App.jsx
├── backend/           Node.js + Express API
│   └── src/
│       ├── routes/        route-scoring and SOS endpoints
│       ├── services/      safety scoring engine (mirrors the ML model)
│       ├── data/          mock context dataset (swap for real open data)
│       └── server.js
├── ml/                Python: RandomForest training script + requirements
│   ├── train_model.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml Runs frontend + backend together with one command
└── README.md
```

## Running it with Docker (no setup required)

If you have [Docker](https://www.docker.com/products/docker-desktop/) installed, this is the fastest way to run the whole app — no Node, npm, or Python installs needed:

```bash
cd saferoute-ai
docker compose up --build
```

Then open **http://localhost:3000** — the frontend is served by nginx and automatically proxies API calls to the backend container. The backend is also directly reachable at `http://localhost:5000/api/health`.

Stop everything with `Ctrl+C`, or `docker compose down` to remove the containers.

To retrain the ML model in its own isolated container:
```bash
cd ml
docker build -t saferoute-ml .
docker run --rm saferoute-ml
```

Each service also has its own standalone `Dockerfile` (`backend/Dockerfile`, `frontend/Dockerfile`, `ml/Dockerfile`) if you want to build/run them individually instead of via compose.

---

## Running it locally without Docker

**1. Backend**
```bash
cd backend
npm install
npm start          # runs on http://localhost:5000
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev         # runs on http://localhost:5173
```

Open `http://localhost:5173` — the frontend talks to the backend automatically (Vite proxy is pre-configured for `/api`).

**3. ML training script** (optional, standalone)
```bash
cd ml
pip install -r requirements.txt
python train_model.py
```
This trains a `RandomForestClassifier` on synthetic route-safety data and prints feature importances — the same features the backend's scoring engine (`backend/src/services/safetyScoring.js`) uses. Swap `generate_synthetic_data()` for a real open-crime/city-safety dataset loader to train on real data, then wire `model.joblib` up behind a small FastAPI service for the backend to call instead of the current heuristic.

---

## Pushing this to your own GitHub repo

I can't create or push to a repo for you (no account access from here), but these are the exact commands once you've downloaded and unzipped this folder:

```bash
cd saferoute-ai
git init
git add .
git commit -m "Initial commit: SafeRoute AI prototype"
```

Then on GitHub: create a new empty repository (no README/gitignore — you already have one), copy the URL it gives you, and run:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Your shareable repo link is `https://github.com/<your-username>/<your-repo-name>`.

---

## Getting a live demo URL

**Frontend (Vercel — free, ~5 min):**
1. Push this repo to GitHub (above).
2. Go to vercel.com → "Add New Project" → import your repo.
3. Set **Root Directory** to `frontend`.
4. Add an environment variable `VITE_API_URL` pointing to your deployed backend URL (see below) + `/api`.
5. Deploy — Vercel gives you a URL like `https://saferoute-ai.vercel.app`.

**Backend (Render — free tier, ~5 min):**
1. Go to render.com → "New Web Service" → connect the same repo.
2. Set **Root Directory** to `backend`, build command `npm install`, start command `npm start`.
3. Deploy — Render gives you a URL like `https://saferoute-ai-backend.onrender.com`.
4. Go back to Vercel and update `VITE_API_URL` to that URL, redeploy the frontend.

That Vercel URL is your **Live Demo** link for the submission form.

---

## Figma

I don't have Figma access, so I can't generate or host a `.fig` file directly. Fastest path before the deadline:
1. Open the app locally or on the deployed Vercel URL.
2. Take screenshots of each screen (route form, results, SOS panel).
3. In Figma, drag the screenshots onto a page and add simple annotations/labels — judges mainly want to see the intended UI flow, not pixel-perfect design.
4. Share → "Copy link" and set access to "Anyone with the link can view."

If you'd like, I can also generate higher-fidelity static mockup images of each screen for you to trace over in Figma.

---

## Demo video

Record your screen (OBS, Loom, or Windows Game Bar) walking through:
1. Fill the route form → submit.
2. Point out the ranked routes and the safety/speed scores.
3. Expand "Why this ranking?" to show the feature breakdown.
4. Tap SOS and show the confirmation banner.
5. Mention the ML training script briefly (`ml/train_model.py`) to show the model behind the scoring.

Keep it under 3 minutes — most hackathon judges skim.
