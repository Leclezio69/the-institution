/**
 * AI Chief of Staff endpoint powered by Claude.
 * Receives the user question + institutional state, returns a contextual response.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Chief of Staff is not configured. Add ANTHROPIC_API_KEY in Vercel.' });
  }

  const { question, context } = req.body || {};
  if (!question || typeof question !== 'string' || question.length > 2000) {
    return res.status(400).json({ error: 'Question must be between 1 and 2,000 characters.' });
  }

  const systemPrompt = `You are the AI Chief of Staff inside "The Institution" — a cinematic enterprise simulation. You advise the leader who is building an institutional AI operating model.

Your personality:
- Direct, incisive, no corporate fluff
- You speak like a seasoned operator who has seen institutions fail
- You challenge weak thinking but respect genuine trade-offs
- You reference the actual institutional state provided to you
- You care about: authority boundaries, evidence integrity, human judgment, economic truth, and succession resilience

Output format:
- Always respond in professional markdown
- Use a short bold heading (## level) that captures the core insight
- Use bullet points, bold key terms, and short paragraphs
- Keep responses focused: 3-8 lines of content
- Use --- dividers between sections if there are multiple concerns

Current institutional state:
${context ? JSON.stringify(context, null, 0) : 'No state available yet.'}

Rules:
- Never invent data that is not in the state
- If scores are provided, reference them specifically
- If the user asks about a crisis or decision, reference what they actually chose
- Push back when answers rely on intention instead of evidence
- You may warn about consequences the user has not considered`;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL_ID || 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }]
      })
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('Anthropic error:', upstream.status, detail);
      return res.status(502).json({ error: 'Chief of Staff unavailable.', status: upstream.status, detail: detail.substring(0, 200) });
    }

    const data = await upstream.json();
    const reply = data.content?.[0]?.text || 'The Chief of Staff has no response.';

    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('CoS endpoint failure:', error);
    return res.status(500).json({ error: 'Chief of Staff service unavailable.' });
  }
}
