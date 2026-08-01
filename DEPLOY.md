# Deployment runbook

## 1. Open in Cursor

Unzip this package and open the extracted `the-institution-cursor-github-vercel` folder in Cursor.

In Cursor's terminal, run:

```bash
npm run validate
npm run preview
```

Open `http://localhost:4173`.

`npm run preview` runs the full browser experience. The cloned voice uses browser speech in this mode because `/api/narrate` requires the Vercel runtime.

To test the serverless API locally instead, run:

```bash
npm run dev
```

The first run may ask `npx` to install the Vercel CLI. Accept the prompt, then open `http://localhost:4173`.

## 2. Create the GitHub repository

From the project terminal:

```bash
git init
git add .
git commit -m "Launch The Institution"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/the-institution.git
git push -u origin main
```

Alternatively, use Cursor's Source Control panel and **Publish Branch**.

## 3. Deploy through Vercel

1. Sign in to Vercel.
2. Select **Add New → Project**.
3. Import the GitHub repository.
4. Framework preset: **Other**.
5. Build command: leave blank.
6. Output directory: leave blank.
7. Select **Deploy**.

Vercel will serve `index.html` at the project root and deploy the functions in `/api` automatically.

## 4. Add ElevenLabs cloned voice

In **Vercel → Project → Settings → Environment Variables**, add:

```text
ELEVENLABS_API_KEY=your_restricted_server_key
ELEVENLABS_VOICE_ID=your_cloned_voice_id
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

Add them to Production, Preview, and Development as required, then redeploy.

Never commit `.env` or `.env.local`. Both are ignored by Git.

## 5. Verify the live deployment

Open these URLs after deployment:

```text
https://YOUR-PROJECT.vercel.app
https://YOUR-PROJECT.vercel.app/api/health
```

The health endpoint should return `"status":"ok"`. `narrationConfigured` becomes `true` after both ElevenLabs secrets are present.

Then test:

- Mandate creation
- Eight-system assembly
- Time-compression decisions
- Authority order scoring
- Board responses
- Institutional autopsy
- JSON record download
- Print charter
- Narration

## Direct CLI deployment

After signing in through the Vercel CLI:

```bash
npm run deploy
```
