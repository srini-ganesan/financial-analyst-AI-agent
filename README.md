# Financial Analyst AI Agent

A React application that ranks the **top 10 equities by trade volume** and uses **Claude AI** to explain why the top 3 are leading the market.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Claude](https://img.shields.io/badge/Claude-Sonnet-orange) ![Recharts](https://img.shields.io/badge/Recharts-2.12-22B5BF) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## What it does

1. **Fetches volume data** from Nasdaq Datalink for a curated watchlist of high-volume equities
2. **Ranks the top 10** by trade volume and displays them in a vertical bar chart
3. **Calls Claude API** to generate bullet-point analysis explaining why the top 3 are leading
4. **Auto-refreshes every hour** — data and analysis update automatically

---

## Architecture

```
src/
├── App.jsx              # Main orchestrator — fetch → chart → analyse → render
├── nasdaqService.js     # Nasdaq Datalink API integration + mock data fallback
├── claudeService.js     # Claude API integration + mock analysis fallback
├── components/
│   ├── VolumeChart.jsx  # Recharts bar chart — top 10 by volume
│   └── AnalysisPanel.jsx # AI bullet-point analysis — top 3
```

**Key design decisions:**
- Both services degrade gracefully to mock data if API keys are missing — the app always runs
- The Nasdaq service and Claude service are fully decoupled — swap either independently
- Auto-refresh is handled by `setInterval` in `App.jsx`, not the individual services

---

## Getting started locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/financial-analyst-agent.git
cd financial-analyst-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
REACT_APP_NASDAQ_API_KEY=your_nasdaq_key
```

**Where to get keys:**
- **Anthropic API key:** https://console.anthropic.com → API Keys
- **Nasdaq Datalink key:** https://data.nasdaq.com → Account → API Key (free tier available)

### 4. Run locally

```bash
npm start
```

Opens at `http://localhost:3000`. If no API keys are set, the app runs in **demo mode** with realistic mock data.

---

## Deploying to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Then add environment variables in the Vercel dashboard:
**Project → Settings → Environment Variables**

Add both:
- `REACT_APP_ANTHROPIC_API_KEY`
- `REACT_APP_NASDAQ_API_KEY`

Redeploy after adding keys: `vercel --prod`

### Option B — GitHub integration

1. Push your repo to GitHub
2. Go to https://vercel.com/new and import the repo
3. Add environment variables during setup
4. Click **Deploy**

---

## Upgrading to live intraday data

The free Nasdaq Datalink tier provides **end-of-day** data. To get true intraday (1-hour) volume:

| Provider | Plan | Notes |
|---|---|---|
| **Nasdaq Datalink Premium** | Paid | Native upgrade path |
| **Polygon.io** | Free tier available | `GET /v2/aggs/ticker/{ticker}/range/1/hour/...` |
| **Alpaca Markets** | Free tier available | WebSocket streaming available |

To swap the data source, only `nasdaqService.js` needs to change. The chart and AI analysis work with any array of `{ ticker, volume, date }` objects.

---

## Customising the watchlist

In `nasdaqService.js`, edit the `WATCHLIST` array:

```js
const WATCHLIST = [
  'AAPL', 'MSFT', 'NVDA', // ... add or remove tickers
];
```

Nasdaq Datalink WIKI dataset supports most major US equities.

---

## Note on API key security

`REACT_APP_*` variables are embedded in the browser bundle at build time. For a **production application**, move API calls to a serverless backend (e.g. Vercel Edge Functions or API Routes) so keys are never exposed client-side. This architecture is appropriate for portfolio and demo purposes.

---

## Built with

- [React 18](https://react.dev/)
- [Recharts](https://recharts.org/)
- [Claude API](https://docs.anthropic.com/)
- [Nasdaq Datalink](https://data.nasdaq.com/)
- [Vercel](https://vercel.com/)
- [Syne](https://fonts.google.com/specimen/Syne) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) fonts

---

*This project is for portfolio and educational purposes. Not financial advice.*
