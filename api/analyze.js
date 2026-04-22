// api/analyze.js — Vercel serverless function
// Keeps the Anthropic API key secure on the server side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { top3 } = req.body;
  if (!top3 || !Array.isArray(top3)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY; // No REACT_APP_ prefix!
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  const prompt = buildPrompt(top3);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a sharp, concise financial analyst AI. 
You explain equity trading volume patterns clearly and factually.
Always respond ONLY with valid JSON — no preamble, no markdown fences.`,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(response.status).json({ error: `Claude API error: ${err}` });
  }

  const data = await response.json();
  const text = data.content?.map((b) => b.text || '').join('') ?? '';
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return res.status(200).json(parsed);
}

function buildPrompt(top3) {
  const tickerList = top3
    .map((t, i) => `${i + 1}. ${t.ticker} — ${new Intl.NumberFormat('en-US').format(t.volume)} shares (as of ${t.date})`)
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
    { "ticker": "TICKER1", "bullets": ["reason one", "reason two", "reason three"] },
    { "ticker": "TICKER2", "bullets": ["reason one", "reason two", "reason three"] },
    { "ticker": "TICKER3", "bullets": ["reason one", "reason two", "reason three"] }
  ]
}
`.trim();
}
