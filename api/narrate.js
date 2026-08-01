/**
 * Vercel serverless narration endpoint.
 * Keeps the ElevenLabs API key on the server and returns an MP3 stream.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

  if (!apiKey || !voiceId) {
    return res.status(503).json({
      error: 'Narration is not configured. Add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in Vercel.'
    });
  }

  if (!text || text.length > 4500) {
    return res.status(400).json({ error: 'Text must contain between 1 and 4,500 characters.' });
  }

  try {
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_22050_32&optimize_streaming_latency=3`;
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.52,
          similarity_boost: 0.82,
          style: 0.0,
          use_speaker_boost: false
        }
      })
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('ElevenLabs error:', upstream.status, detail);
      return res.status(upstream.status).json({ error: 'Narration generation failed.' });
    }

    // Stream audio chunks directly instead of buffering the full response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Transfer-Encoding', 'chunked');
    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    return res.end();
  } catch (error) {
    console.error('Narration endpoint failure:', error);
    return res.status(500).json({ error: 'Narration service unavailable.' });
  }
}
