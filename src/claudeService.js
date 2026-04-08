// ─────────────────────────────────────────────────────────────────────────────
// claudeService.js
//
// Calls the Anthropic Claude API to generate bullet-point analysis
// explaining why the top 3 equities are leading by volume.
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Given the top 3 equities with their volume data, asks Claude to explain
 * why each is leading by trade volume. Returns an array of analysis objects.
 *
 * @param {Array<{ticker: string, volume: number, date: string}>} top3
 * @returns {Promise<Array<{ticker: string, bullets: string[]}>>}
 */
export async function analyzeTop3(top3) {
  if (!ANTHROPIC_API_KEY) {
    return getMockAnalysis(top3);
  }

  const prompt = buildPrompt(top3);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: `You are a sharp, concise financial analyst AI. 
You explain equity trading volume patterns clearly and factually.
Always respond ONLY with valid JSON — no preamble, no markdown fences.`,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.map((b) => b.text || '').join('') ?? '';

  // Strip any accidental markdown fences before parsing
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.analysis;
}

function buildPrompt(top3) {
  const tickerList = top3
    .map((t, i) => `${i + 1}. ${t.ticker} — ${formatVolume(t.volume)} shares (as of ${t.date})`)
    .join('\n');

  return `
The following 3 equities are leading the market today by trade volume:

${tickerList}

For each ticker, provide 3 concise bullet points explaining WHY it is trading at high volume today.
Consider: recent earnings, product launches, macroeconomic factors, sector momentum, index rebalancing,
options expiry, analyst upgrades/downgrades, or any other relevant driver.

Respond with ONLY this JSON structure (no markdown, no extra text):
{
  "analysis": [
    {
      "ticker": "TICKER1",
      "bullets": ["reason one", "reason two", "reason three"]
    },
    {
      "ticker": "TICKER2",
      "bullets": ["reason one", "reason two", "reason three"]
    },
    {
      "ticker": "TICKER3",
      "bullets": ["reason one", "reason two", "reason three"]
    }
  ]
}
`.trim();
}

function formatVolume(v) {
  return new Intl.NumberFormat('en-US').format(v);
}

/**
 * Fallback mock analysis used when no API key is configured.
 */
function getMockAnalysis(top3) {
  const mockReasons = {
    SPY: [
      'Broad market ETF sees elevated volume during macro uncertainty as investors rebalance portfolios.',
      'End-of-quarter institutional rebalancing drives SPY inflows above typical daily average.',
      'Fed commentary triggered options hedging activity, lifting underlying ETF volume significantly.',
    ],
    NVDA: [
      'Continued AI infrastructure spending narrative keeps institutional demand elevated.',
      'Recent data center partnership announcement accelerated momentum buying from growth funds.',
      'Options market gamma squeeze dynamics amplified share volume near key strike levels.',
    ],
    AAPL: [
      'iPhone demand data from supply chain checks triggered analyst note upgrades this session.',
      'Services revenue beat expectations in the most recent earnings report, sustaining buy interest.',
      'Index fund rebalancing after AAPL weight adjustment lifted passive buying volume.',
    ],
    QQQ: [
      'Tech sector rotation into large-cap growth names drove QQQ inflows above 30-day average.',
      'Options expiry week increases hedging activity via the underlying ETF.',
      'Retail investor inflows into tech-focused funds elevated throughout the session.',
    ],
    TSLA: [
      'CEO public statements on autonomous driving timeline reignited speculative interest.',
      'Short-covering rally after recent drawdown contributed to volume spike.',
      'Delivery estimate revisions by sell-side analysts triggered active repositioning.',
    ],
    DEFAULT: [
      'Elevated sector momentum attracted institutional and retail buying interest.',
      'Recent news catalyst drove above-average intraday trading activity.',
      'Technical breakout above key resistance level triggered algorithmic volume.',
    ],
  };

  return top3.map((item) => ({
    ticker: item.ticker,
    bullets: mockReasons[item.ticker] || mockReasons['DEFAULT'],
  }));
}
