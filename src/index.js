const { discoverBookUrls } = require('./discover');
const { extractAllBookDetails } = require('./extract');

async function main() {
  const { pageCount, bookEntries } = await discoverBookUrls();

  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${bookEntries.length}`);
  console.log(`unique_urls=${bookEntries.length}`);

  const records = await extractAllBookDetails(bookEntries);

  console.log(`detail_pages=${records.length}`);
  console.log('Sample record:', JSON.stringify(records[0], null, 2));
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});