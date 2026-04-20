// ─────────────────────────────────────────────────────────────────────────────
// nasdaqService.js
//
// Fetches top equity volume data from Alpha Vantage.
//
// FREE TIER NOTE:
//   Alpha Vantage free tier provides 25 API requests/day.
//   This service fetches recent EOD volume for a curated watchlist and ranks
//   them — simulating a "last session" snapshot.
// ─────────────────────────────────────────────────────────────────────────────

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

// Curated watchlist of high-volume S&P 500 equities
// Reduced to 10 to stay within free tier limits (25 requests/day)
const WATCHLIST = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL',
  'META', 'TSLA', 'AMD', 'SPY', 'QQQ',
];

/**
 * Fetches the most recent end-of-day volume for a single ticker
 * using Alpha Vantage TIME_SERIES_DAILY endpoint.
 */
async function fetchTickerVolume(ticker) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${ticker}: ${res.status}`);
  const json = await res.json();

  // Alpha Vantage returns an error message if rate limited
  if (json['Note'] || json['Information']) {
    throw new Error(`Rate limit reached for ${ticker}`);
  }

  const timeSeries = json['Time Series (Daily)'];
  if (!timeSeries) throw new Error(`No data for ${ticker}`);

  // Get the most recent trading day
  const latestDate = Object.keys(timeSeries)[0];
  const latestData = timeSeries[latestDate];
  const volume = parseInt(latestData['5. volume'], 10) ?? 0;

  return { ticker, volume, date: latestDate };
}

/**
 * Fetches volume for all watchlist tickers sequentially to avoid
 * hitting Alpha Vantage rate limits, sorts by volume descending,
 * and returns the top 10.
 */
export async function fetchTop10ByVolume() {
  const results = [];

  for (const ticker of WATCHLIST) {
    try {
      const data = await fetchTickerVolume(ticker);
      results.push(data);
      // Small delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch (err) {
      console.warn(`Skipping ${ticker}:`, err.message);
    }
  }

  return results
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);
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
  return base.map((item) => ({
    ...item,
    volume: Math.round(item.volume * (0.92 + Math.random() * 0.16)),
    date: new Date().toISOString().split('T')[0],
  }));
}
