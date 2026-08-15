const fs = require('fs');
const path = require('path');

const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/Gaurav-biswal/book-scraper)';
const TIMEOUT_MS = 8000;

async function politeFetch(url, cachePath) {
  const fullCachePath = path.join(__dirname, '..', 'cache', cachePath);

  if (fs.existsSync(fullCachePath)) {
    const html = fs.readFileSync(fullCachePath, 'utf-8');
    console.log(`CACHE HIT: ${url} (${html.length} bytes)`);
    return html;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${url}: status ${response.status}`);
  }

  const html = await response.text();

  fs.mkdirSync(path.dirname(fullCachePath), { recursive: true });
  fs.writeFileSync(fullCachePath, html, 'utf-8');

  console.log(`FETCH: ${url} (${html.length} bytes)`);
  return html;
}

module.exports = { politeFetch };