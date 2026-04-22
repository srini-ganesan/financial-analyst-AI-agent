// claudeService.js
// Calls our own Vercel serverless function instead of Anthropic directly.
// This keeps the API key secure on the server side.

export async function analyzeTop3(top3) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ top3 }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (err) {
    console.warn('AI analysis failed, using mock data:', err.message);
    return getMockAnalysis(top3);
  }
}

function getMockAnalysis(top3) {
  const mockReasons = {
    NVDA:  ['Continued AI infrastructure spending narrative keeps institutional demand elevated.', 'Recent data center partnership announcement accelerated momentum buying.', 'Options gamma squeeze dynamics amplified share volume near key strike levels.'],
    AAPL:  ['iPhone demand data from supply chain checks triggered analyst upgrades.', 'Services revenue beat expectations in the most recent earnings report.', 'Index fund rebalancing after weight adjustment lifted passive buying volume.'],
    MSFT:  ['Azure cloud growth beat estimates, sustaining buy interest from growth funds.', 'Copilot AI integration announcements drove renewed institutional interest.', 'Dividend increase announcement attracted income-focused fund inflows.'],
    AMZN:  ['AWS re:Invent announcements reignited cloud growth optimism.', 'Advertising revenue segment growth exceeded sell-side expectations.', 'Prime membership data showed stronger-than-expected retention rates.'],
    GOOGL: ['Search market share data showed resilience despite AI competition concerns.', 'YouTube ad revenue recovery drove positive sentiment among media analysts.', 'Quantum computing breakthrough announcement generated speculative interest.'],
    DEFAULT: ['Elevated sector momentum attracted institutional and retail buying interest.', 'Recent news catalyst drove above-average intraday trading activity.', 'Technical breakout above key resistance level triggered algorithmic volume.'],
  };

  return top3.map((item) => ({
    ticker: item.ticker,
    bullets: mockReasons[item.ticker] || mockReasons['DEFAULT'],
  }));
}
