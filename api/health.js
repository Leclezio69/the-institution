/**
 * Lightweight deployment check. It never exposes secret values.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'ok',
    application: 'the-institution',
    narrationConfigured: Boolean(
      process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID
    ),
    timestamp: new Date().toISOString()
  });
}
