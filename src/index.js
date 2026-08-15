const { discoverBookUrls } = require('./discover');

async function main() {
  const { pageCount, bookUrls } = await discoverBookUrls();

  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${bookUrls.length}`);
  console.log(`unique_urls=${new Set(bookUrls).size}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});