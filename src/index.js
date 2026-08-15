const { discoverBookUrls } = require('./discover');
const { extractAllBookDetails } = require('./extract');
const { validateAndStore } = require('./store');
const { writeRunReport } = require('./report');

async function main() {
  const startTime = Date.now();

  const { pageCount, bookEntries } = await discoverBookUrls();
  console.log(`catalogue_pages=${pageCount}`);
  console.log(`discovered=${bookEntries.length}`);
  console.log(`unique_urls=${bookEntries.length}`);

  const { records: rawRecords, failures } = await extractAllBookDetails(bookEntries);
  console.log(`detail_pages=${rawRecords.length}`);
  console.log(`failed_pages=${failures.length}`);

  const { validCount, errorCount } = validateAndStore(rawRecords);
  console.log(`valid_records=${validCount}`);
  console.log(`invalid_records=${errorCount}`);

  const report = writeRunReport({
    startTime,
    pageCount,
    cacheHits: 0, // simple placeholder for now; refined in the optional extras
    fetchCount: 0,
    validCount,
    errorCount,
    failures,
  });

  console.log('Run report written:', JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});