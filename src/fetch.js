const fs = require('fs');
const path = require('path');

const USER_AGENT = 'FlyRankInternshipA9/1.0 (+https://github.com/Gaurav-biswal/book-scraper)';
const TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 1500;

async function rawFetch(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return { ok: true, status: response.status, response };
  } catch (err) {
    clearTimeout(timeoutId);
    return { ok: false, status: null, error: err.message };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Returns { success: true, html } or { success: false, status, reason }.
// Never throws — callers decide what to do with a failure.
async function politeFetch(url, cachePath) {
  const fullCachePath = path.join(__dirname, '..', 'cache', cachePath);

  if (fs.existsSync(fullCachePath)) {
    const html = fs.readFileSync(fullCachePath, 'utf-8');
    console.log(`CACHE HIT: ${url} (${html.length} bytes)`);
    return { success: true, html, fromCache: true };
  }

  let attempt = 0;
  const maxAttempts = 2; // one try + one retry, only for timeouts/5xx

  while (attempt < maxAttempts) {
    attempt++;
    const result = await rawFetch(url);

    if (!result.ok) {
      // Network-level failure (timeout, DNS, etc.) - worth one retry.
      if (attempt < maxAttempts) {
        console.log(`RETRY (network error): ${url} - ${result.error}`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { success: false, status: null, reason: result.error };
    }

    const { status, response } = result;

    if (status === 200) {
      const html = await response.text();
      fs.mkdirSync(path.dirname(fullCachePath), { recursive: true });
      fs.writeFileSync(fullCachePath, html, 'utf-8');
      console.log(`FETCH: ${url} (${html.length} bytes)`);
      return { success: true, html, fromCache: false };
    }

    if (status >= 500 && attempt < maxAttempts) {
      console.log(`RETRY (${status}): ${url}`);
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    // 404, 403, or a 5xx that already used its retry: fail without retrying further.
    return { success: false, status, reason: `HTTP ${status}` };
  }

  return { success: false, status: null, reason: 'exhausted retries' };
}

module.exports = { politeFetch };