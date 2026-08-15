const cheerio = require("cheerio");
const { politeFetch } = require("./fetch");

const BASE_URL = "https://books.toscrape.com";
const DELAY_MS = 600;
const MAX_PAGES = 3; // Assignment scope: follow "next" to page 2, then page 3, then stop.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function discoverBookUrls() {
  const bookMap = new Map();
  let pageUrl = `${BASE_URL}/catalogue/page-1.html`;
  let pageNumber = 1;

  while (pageUrl && pageNumber <= MAX_PAGES) {
    const cacheFile = `catalogue-page-${pageNumber}.html`;

    const result = await politeFetch(pageUrl, cacheFile);

    if (!result.success) {
      // A broken catalogue page is unlikely but should not crash discovery either.
      console.log(`FAILED (catalogue page): ${pageUrl} - ${result.reason}`);
      break;
    }

    if (!result.fromCache) {
      await sleep(DELAY_MS);
    }

    const $ = cheerio.load(result.html);
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