import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';
import { prepareMetadata } from './prepare-hosting.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = resolve(root, 'dist');
const html = await readFile(resolve(publicRoot, 'index.html'), 'utf8');
const config = JSON.parse(await readFile(resolve(root, 'firebase.json'), 'utf8'));
assert.equal(config.hosting.public, 'dist', 'Firebase must serve the complete dist folder.');
assert.ok(!/chatgpt\.site|appgprj_|OAI-Sites-Authorization/.test(html), 'Old hosting references must not be shipped.');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique.');
let localReferences = 0;
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const url = match[1];
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue;
  if (url.startsWith('#')) {
    assert.ok(url === '#' || ids.includes(decodeURIComponent(url.slice(1))), `Missing section: ${url}`);
    continue;
  }
  const file = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  const target = resolve(publicRoot, `.${file.startsWith('/') ? file : '/' + file}`);
  assert.ok(target.startsWith(publicRoot + sep), `Asset is outside the public folder: ${file}`);
  assert.ok((await stat(target)).isFile(), `Missing asset: ${file}`);
  localReferences++;
}

const app = await readFile(resolve(publicRoot, 'app.js'), 'utf8');
new Script(app, { filename: 'app.js' });
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal((await readFile(resolve(publicRoot, 'Ramesh-Ganamana-Resume.pdf'))).subarray(0, 5).toString(), '%PDF-');
assert.ok((await stat(resolve(publicRoot, 'ramesh-ganamana.jpg'))).size > 0, 'Portrait is missing.');

const prepared = prepareMetadata(html, 'https://portfolio-check.web.app');
assert.match(prepared, /<meta property="og:url" content="https:\/\/portfolio-check\.web\.app\/">/);
assert.match(prepared, /content="https:\/\/portfolio-check\.web\.app\/social\.svg"/);
assert.equal(prepareMetadata(prepared, 'https://portfolio-check.web.app'), prepared, 'Metadata preparation must be repeatable.');
assert.equal(html.slice(html.indexOf('<body>')), prepared.slice(prepared.indexOf('<body>')), 'Metadata preparation must preserve all page content.');

async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(target));
    else files.push(relative(publicRoot, target));
  }
  return files;
}
const files = await filesIn(publicRoot);
assert.ok(!files.some(file => /(^|[\\/])\.|\.env|credentials|service.account|\.pem$/i.test(file)), 'Only public site assets belong in dist.');
console.log(`Site checks passed: ${files.length} public files, ${localReferences} asset references, valid navigation, JavaScript, résumé, portrait, and portable metadata.`);
