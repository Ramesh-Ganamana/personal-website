import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

export function prepareMetadata(html, siteUrl) {
  const parsed = new URL(siteUrl);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('The site URL must be a plain HTTP(S) origin, for example https://your-project.web.app.');
  }
  const canonical = `${parsed.origin}/`;
  const imageUrl = new URL('social.svg', canonical).href;
  let result = html.replace(/\s*<meta property="og:url" content="[^"]*">/g, '');
  result = result.replace(/\s*<link rel="canonical" href="[^"]*">/g, '');
  result = result.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="${imageUrl}">`);
  result = result.replace('<title>', `<link rel="canonical" href="${canonical}">\n  <title>`);
  result = result.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, start, json, end) => {
    const person = JSON.parse(json);
    person.url = canonical;
    return start + JSON.stringify(person) + end;
  });
  return result;
}

async function main() {
  const config = JSON.parse(await readFile(resolve(root, 'site.config.json'), 'utf8'));
  const project = process.env.GCLOUD_PROJECT?.trim();
  const siteUrl = process.env.SITE_URL?.trim() || config.url?.trim() || (project ? `https://${project}.web.app` : '');
  if (!siteUrl) {
    console.log('Portable static files are ready. Firebase will set the sharing URLs during deployment.');
    return;
  }
  const indexPath = resolve(root, 'dist/index.html');
  const html = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, prepareMetadata(html, siteUrl), 'utf8');
  console.log(`Prepared canonical and sharing URLs for ${new URL(siteUrl).origin}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
