# Bitget Adaptive Risk Profiling Engine

AI-powered crypto portfolio risk dashboard built for the Bitget HackerCon hackathon.

## Features

- **Live Risk Gauge** — composite risk score with animated arc
- **Radar Chart** — 6-factor risk breakdown
- **Portfolio Allocation** — interactive donut chart + tolerance slider
- **Behavior Heatmap** — 7-day trading intensity grid
- **Market Sentiment** — Fear & Greed index with per-token scores
- **Stress Test Simulator** — 4 crisis scenarios (flash crash, black swan, etc.)
- **AI Portfolio Analyst** — Claude-powered chat with live portfolio context
- **Risk Alert Notifications** — auto-triggered toast alerts
- **Portfolio Save/Load** — cloud persistence via REST API

---

## Project Structure

```
bitget-risk-dashboard/
├── public/
│   └── index.html        # Full frontend (single file)
├── server/
│   └── index.js          # Express backend (API proxy + portfolio store)
├── package.json
├── .env.example
└── .gitignore
```

---

## 🚀 Deploy in 3 Steps

### Step 1 — Push to GitHub

```bash
# In your terminal, from this folder:
git init
git add .
git commit -m "Initial commit — Bitget Risk Dashboard"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bitget-risk-dashboard.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Deploy to Render

1. Go to **[render.com](https://render.com)** → **New** → **Web Service**
2. Connect your GitHub repo: `bitget-risk-dashboard`
3. Fill in the settings:

| Field | Value |
|-------|-------|
| **Name** | `bitget-risk-dashboard` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

4. Click **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `your_key_from_console.anthropic.com` |

5. Click **Create Web Service** — Render builds and deploys automatically.

Your live URL will be: `https://bitget-risk-dashboard.onrender.com`

---

### Step 3 — Get your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. **API Keys** → **Create Key**
3. Copy the key and paste it into Render's environment variables (Step 2 above)

---

## Local Development

```bash
# Install dependencies
npm install

# Create your local .env
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
npm run dev
# Open http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | AI chat proxy (keeps API key server-side) |
| `POST` | `/api/portfolio` | Save portfolio snapshot → returns `{ id }` |
| `GET` | `/api/portfolio/:id` | Load portfolio snapshot by ID |
| `GET` | `/health` | Health check (used by Render) |

---

## Notes

- Portfolio data is stored in memory — it resets when the server restarts. For persistent storage, swap the `Map` in `server/index.js` for a database (e.g. MongoDB Atlas free tier or Render PostgreSQL).
- The free Render tier spins down after 15 minutes of inactivity. First load after sleep takes ~30 seconds.
