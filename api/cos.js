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

  // Try models from newest to oldest until one works
  const models = process.env.ANTHROPIC_MODEL_ID
    ? [process.env.ANTHROPIC_MODEL_ID]
    : [
        'claude-sonnet-5',
        'claude-sonnet-4-6-20250725',
        'claude-sonnet-4-20250514',
        'claude-3-7-sonnet-20250219',
        'claude-3-5-sonnet-20241022'
      ];

  for (const model of models) {
    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }]
        })
      });

      if (upstream.ok) {
        const data = await upstream.json();
        // Find the text block (skip thinking blocks from extended thinking models)
        const textBlock = data.content?.find(b => b.type === 'text');
        const reply = textBlock?.text || data.content?.[0]?.text || 'The Chief of Staff has no response.';
        res.setHeader('Cache-Control', 'private, no-store');
        return res.status(200).json({ reply, model });
      }

      const detail = await upstream.text();
      // If model not found, try next one
      if (upstream.status === 404) {
        console.log('Model not available:', model);
        continue;
      }
      // Other errors (auth, rate limit) — don't retry
      console.error('Anthropic error:', upstream.status, detail);
      return res.status(502).json({ error: 'Chief of Staff unavailable.', status: upstream.status, detail: detail.substring(0, 200) });
    } catch (error) {
      console.error('CoS fetch error for model', model, ':', error.message);
      continue;
    }
  }

  return res.status(502).json({ error: 'No available Claude model found. Set ANTHROPIC_MODEL_ID in Vercel env vars.' });
}
