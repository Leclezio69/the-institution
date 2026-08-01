# THE INSTITUTION

A cinematic, living-enterprise simulation that assembles an institutional AI operating model around the visitor's mandate.

## Experience included

- Adaptive mandate intake and institutional signature
- Eight-system operating organism
- Five-strand Institutional DNA
- Five time-compression decisions from Day 1 to Year 5
- Free-text Authority Chamber with eight-dimensional command scoring
- Three-future Counterfactual Observatory
- Six-member Living Board challenge
- Institutional Autopsy and durability verdict
- Board-grade charter and downloadable JSON evidence record
- Real SHA-256 evidence chain and terminal record hash
- AI Chief of Staff
- Dark/light themes and responsive layout
- Secure ElevenLabs cloned-voice narration with browser fallback

## Repository map

```text
.
├── index.html                 Complete simulation
├── api/
│   ├── narrate.js             Secure ElevenLabs narration proxy
│   └── health.js              Deployment/configuration health check
├── scripts/
│   └── validate.mjs           Pre-deployment package validation
├── .github/workflows/
│   └── validate.yml           GitHub validation on push and pull request
├── .env.example               Environment-variable template
├── vercel.json                Vercel functions and security headers
├── package.json               Local, validation, and deployment commands
└── DEPLOY.md                  Cursor → GitHub → Vercel runbook
```

## Start in Cursor

```bash
npm run validate
npm run preview
```

Open `http://localhost:4173`.

For local Vercel functions, including `/api/narrate` and `/api/health`:

```bash
npm run dev
```

## Deploy

Import the GitHub repository into Vercel with framework preset **Other**. No build command or output directory is required.

For the exact sequence, read [`DEPLOY.md`](DEPLOY.md).

## ElevenLabs configuration

Add these environment variables in Vercel:

```text
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

The key remains server-side. Without the variables, the interface automatically falls back to browser narration.

## Security

- Never add a real API key to `index.html` or tracked files.
- Use a restricted ElevenLabs key with an appropriate usage quota.
- `.env` and `.env.local` are excluded from Git.
- Security headers are configured in `vercel.json`.
