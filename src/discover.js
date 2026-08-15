const cheerio = require("cheerio");
const { politeFetch } = require("./fetch");

const BASE_URL = "https://books.toscrape.com";
const DELAY_MS = 600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function discoverBookUrls() {
  const allBookUrls = new Set();
  let pageUrl = `${BASE_URL}/catalogue/page-1.html`;
  let pageNumber = 1;
  let wasCached = false;

  while (pageUrl) {
    const cacheFile = `catalogue-page-${pageNumber}.html`;
    const alreadyCached = require("fs").existsSync(
      require("path").join(__dirname, "..", "cache", cacheFile),
    );

    const html = await politeFetch(pageUrl, cacheFile);

    if (!alreadyCached) {
      await sleep(DELAY_MS);
    }

    const $ = cheerio.load(html);

    $("article.product_pod h3 a").each((_, el) => {
      const href = $(el).attr("href");
      const absoluteUrl = new URL(href, pageUrl).href;
      allBookUrls.add(absoluteUrl);
    });

    const nextHref = $("li.next a").attr("href");
    if (nextHref && pageNumber < 3) {
      pageNumber++;
      pageUrl = new URL(nextHref, pageUrl).href;
    } else {
      pageUrl = null;
    }
  }

  return { pageCount: pageNumber, bookUrls: Array.from(allBookUrls) };
}

module.exports = { discoverBookUrls };
