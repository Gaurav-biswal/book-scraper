const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "output");

function writeRunReport({ startTime, pageCount, cacheHits, fetchCount, validCount, errorCount, failures }) {
  const endTime = Date.now();

  const report = {
    start_time: new Date(startTime).toISOString(),
    duration_ms: endTime - startTime,
    catalogue_pages_fetched: pageCount,
    cache_hits: cacheHits,
    pages_fetched_from_network: fetchCount,
    valid_records: validCount,
    invalid_records: errorCount,
    failed_pages: failures.length,
    failures: failures,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "run-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  return report;
}

module.exports = { writeRunReport };