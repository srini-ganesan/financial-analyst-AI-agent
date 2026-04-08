// ─────────────────────────────────────────────────────────────────────────────
// nasdaqService.js
//
// Fetches top equity volume data from Nasdaq Datalink.
//
// FREE TIER NOTE:
//   Nasdaq Datalink's free tier (WIKI dataset) provides end-of-day data.
//   This service fetches recent EOD volume for a curated watchlist and ranks
//   them — simulating a "last session" snapshot.
//
// TO UPGRADE TO LIVE INTRADAY DATA:
//   Replace fetchVolumeData() with a call to Polygon.io, Alpaca Markets, or
//   Nasdaq's premium intraday feed. The rest of the app (chart + AI analysis)
//   works identically — just swap this service.
// ─────────────────────────────────────────────────────────────────────────────

const NASDAQ_API_KEY = process.env.REACT_APP_NASDAQ_API_KEY;

// Curated watchlist of high-volume S&P 500 equities
const WATCHLIST = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL',
  'META', 'TSLA', 'AMD', 'INTC', 'BAC',
  'JPM', 'XOM', 'SPY', 'QQQ', 'PLTR',
];

/**
 * Fetches the most recent end-of-day volume for a single ticker
 * using the Nasdaq Datalink WIKI dataset.
 */
async function fetchTickerVolume(ticker) {
  const url = `https://data.nasdaq.com/api/v3/datasets/WIKI/${ticker}.json?rows=1&column_index=5&api_key=${NASDAQ_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${ticker}: ${res.status}`);
  const json = await res.json();
  const volume = json?.dataset?.data?.[0]?.[1] ?? 0;
  const date = json?.dataset?.data?.[0]?.[0] ?? 'N/A';
  return { ticker, volume, date };
}

/**
 * Fetches volume for all watchlist tickers in parallel,
 * sorts by volume descending, and returns the top 10.
 */
export async function fetchTop10ByVolume() {
  const results = await Promise.allSettled(
    WATCHLIST.map((ticker) => fetchTickerVolume(ticker))
  );

  const successful = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  return successful;
}

/**
 * Returns mock data for development/demo when no API key is set.
 * Simulates realistic volume figures with minor random variation.
 */
export function getMockData() {
  const base = [
    { ticker: 'SPY',   volume: 98_200_000 },
    { ticker: 'NVDA',  volume: 87_400_000 },
    { ticker: 'AAPL',  volume: 74_300_000 },
    { ticker: 'QQQ',   volume: 68_100_000 },
    { ticker: 'TSLA',  volume: 61_500_000 },
    { ticker: 'AMD',   volume: 54_700_000 },
    { ticker: 'AMZN',  volume: 48_200_000 },
    { ticker: 'MSFT',  volume: 41_900_000 },
    { ticker: 'PLTR',  volume: 38_400_000 },
    { ticker: 'META',  volume: 31_600_000 },
  ];

  // Add ±8% random variation to simulate live refresh
  return base.map((item) => ({
    ...item,
    volume: Math.round(item.volume * (0.92 + Math.random() * 0.16)),
    date: new Date().toISOString().split('T')[0],
  }));
}
