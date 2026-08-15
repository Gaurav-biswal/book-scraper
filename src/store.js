const fs = require("fs");
const path = require("path");
const { normalizeRecord } = require("./normalize");
const { BookRecordSchema } = require("./schema");

const OUTPUT_DIR = path.join(__dirname, "..", "output");

function validateAndStore(rawRecords) {
  const seenUrls = new Set();
  const validRecords = [];
  const errors = [];

  for (const raw of rawRecords) {
    const normalized = normalizeRecord(raw);

    // Canonical identity: if we've already seen this product_url, skip it (idempotency).
    if (seenUrls.has(normalized.product_url)) {
      continue;
    }

    const result = BookRecordSchema.safeParse(normalized);

    if (result.success) {
      seenUrls.add(normalized.product_url);
      validRecords.push(result.data);
    } else {
      errors.push({
        product_url: normalized.product_url,
        reason: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "books.json"),
    JSON.stringify(validRecords, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "errors.json"),
    JSON.stringify(errors, null, 2),
    "utf-8"
  );

  return { validCount: validRecords.length, errorCount: errors.length };
}

module.exports = { validateAndStore };