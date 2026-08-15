const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { politeFetch } = require("./fetch");

const BASE_URL = "https://books.toscrape.com";
const DELAY_MS = 600;
const MAX_PAGES = 3; // Assignment scope: follow "next" to page 2, then page 3, then stop.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCached(cacheFile) {
  return fs.existsSync(path.join(__dirname, "..", "cache", cacheFile));
}

async function discoverBookUrls() {
  // Map instead of Set: url -> sourcePage, so we keep provenance for Stage 3.
  const bookMap = new Map();
  let pageUrl = `${BASE_URL}/catalogue/page-1.html`;
  let pageNumber = 1;

  while (pageUrl) {
    const cacheFile = `catalogue-page-${pageNumber}.html`;
    const alreadyCached = isCached(cacheFile);

    const html = await politeFetch(pageUrl, cacheFile);

    if (!alreadyCached) {
      await sleep(DELAY_MS);
    }

    const $ = cheerio.load(html);
    const currentPageUrl = pageUrl;

    $("article.product_pod h3 a").each((_, el) => {
      const href = $(el).attr("href");
      const absoluteUrl = new URL(href, currentPageUrl).href;
      if (!bookMap.has(absoluteUrl)) {
        bookMap.set(absoluteUrl, currentPageUrl);
      }
    });

    const nextHref = $("li.next a").attr("href");
    if (nextHref && pageNumber < MAX_PAGES) {
      pageNumber++;
      pageUrl = new URL(nextHref, currentPageUrl).href;
    } else {
      pageUrl = null;
    }
  }

  const bookEntries = Array.from(bookMap.entries()).map(([url, sourcePage]) => ({
    url,
    sourcePage,
  }));

  return { pageCount: pageNumber, bookEntries };
}

module.exports = { discoverBookUrls };