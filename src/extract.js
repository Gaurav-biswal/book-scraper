const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { politeFetch } = require("./fetch");

const DELAY_MS = 600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCached(cacheFile) {
  return fs.existsSync(path.join(__dirname, "..", "cache", cacheFile));
}

// Turn a book's product_url into a safe, unique local cache filename.
// e.g. https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html
//   -> book-a-light-in-the-attic_1000.html
function cacheFilenameFor(url) {
  const { pathname } = new URL(url);
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments[segments.length - 2] || "unknown-book";
  return `book-${slug}.html`;
}

// Extracts the 8 required raw fields from one book detail page's HTML.
// Selectors are scoped to .product_main (the product area), not the whole document.
function parseBookDetail(html, productUrl, sourcePage) {
  const $ = cheerio.load(html);
  const main = $(".product_main");

  const title = main.find("h1").text().trim();
  const price_text = main.find(".price_color").first().text().trim();

  const availability_text = main.find(".availability").text().replace(/\s+/g, " ").trim();

  const ratingClasses = (main.find("p.star-rating").attr("class") || "").split(" ");
  const rating_text = ratingClasses.find((c) => c !== "star-rating") || null;

  const descriptionHeading = $("#product_description");
  const description = descriptionHeading.length
    ? descriptionHeading.next("p").text().trim()
    : null;

  return {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}

async function extractAllBookDetails(bookEntries) {
  const records = [];
  const failures = [];

  for (const { url, sourcePage } of bookEntries) {
    const cacheFile = cacheFilenameFor(url);
    const alreadyCached = isCached(cacheFile);

    const result = await politeFetch(url, cacheFile);

    if (!result.success) {
      console.log(`FAILED: ${url} - ${result.reason}`);
      failures.push({ url, reason: result.reason });
      continue; // skip this one page, keep going
    }

    if (!alreadyCached && !result.fromCache) {
      await sleep(DELAY_MS);
    }

    const record = parseBookDetail(result.html, url, sourcePage);
    records.push(record);
  }

  return { records, failures };
}

module.exports = { extractAllBookDetails };