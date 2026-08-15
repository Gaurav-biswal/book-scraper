const { discoverBookUrls } = require('./discover');
const { extractAllBookDetails } = require('./extract');
const { validateAndStore } = require('./store');

async function main() {
  const { pageCount, bookEntries } = await discoverBookUrls();

  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${bookEntries.length}`);
  console.log(`unique_urls=${bookEntries.length}`);

  const rawRecords = await extractAllBookDetails(bookEntries);
  console.log(`detail_pages=${rawRecords.length}`);

  const { validCount, errorCount } = validateAndStore(rawRecords);
  console.log(`valid_records=${validCount}`);
  console.log(`invalid_records=${errorCount}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});