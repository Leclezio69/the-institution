import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const required = [
  'index.html',
  'package.json',
  'vercel.json',
  '.env.example',
  'api/narrate.js',
  'api/health.js'
];

const failures = [];

for (const file of required) {
  try {
    await access(path.join(root, file), constants.R_OK);
  } catch {
    failures.push(`Missing required file: ${file}`);
  }
}

const html = await readFile(path.join(root, 'index.html'), 'utf8');
const narrate = await readFile(path.join(root, 'api/narrate.js'), 'utf8');

const htmlChecks = [
  ['HTML doctype', /^<!DOCTYPE html>/i.test(html)],
  ['Responsive viewport', /name=["']viewport["']/i.test(html)],
  ['Narration endpoint wired', /\/api\/narrate/.test(html)],
  ['Evidence-chain hashing present', /SHA-256|crypto\.subtle\.digest/i.test(html)],
  ['Institutional record export present', /download-json|institutional-record/i.test(html)]
];

for (const [label, ok] of htmlChecks) {
  if (!ok) failures.push(`HTML check failed: ${label}`);
}

const secretPatterns = [
  /sk_[A-Za-z0-9_-]{20,}/,
  /xi-api-key\s*[:=]\s*["'][^"']{12,}/i,
  /ELEVENLABS_API_KEY\s*=\s*[^\s"']{12,}/
];

for (const pattern of secretPatterns) {
  if (pattern.test(html) || pattern.test(narrate)) {
    failures.push(`Possible secret embedded in tracked source: ${pattern}`);
  }
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
if (!scriptMatch) {
  failures.push('Could not locate the main inline JavaScript block.');
} else {
  const temp = path.join(root, '.validate-inline-script.mjs');
  await import('node:fs/promises').then(({ writeFile }) => writeFile(temp, scriptMatch[1]));
  const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
  await import('node:fs/promises').then(({ unlink }) => unlink(temp).catch(() => {}));
  if (result.status !== 0) failures.push(`Inline JavaScript syntax error:\n${result.stderr}`);
}

for (const file of ['api/narrate.js', 'api/health.js']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${file} syntax error:\n${result.stderr}`);
}

if (failures.length) {
  console.error('\nValidation failed:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('✓ Repository structure complete');
console.log('✓ HTML experience wired correctly');
console.log('✓ Inline and serverless JavaScript syntax valid');
console.log('✓ No obvious embedded secrets detected');
console.log('✓ Ready for Cursor → GitHub → Vercel');
