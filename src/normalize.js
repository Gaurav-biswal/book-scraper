function parsePriceGbp(priceText) {
  // "£51.77" -> 51.77. Strip the currency symbol and any stray whitespace, then parse as a float.
  const cleaned = priceText.replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
}

function normalizeRecord(raw) {
  return {
    title: raw.title,
    product_url: raw.product_url, // canonical identity, already absolute
    price_text: raw.price_text,
    price_gbp: parsePriceGbp(raw.price_text),
    availability_text: raw.availability_text,
    rating_text: raw.rating_text,
    description: raw.description,
    source_page: raw.source_page,
    fetched_at: raw.fetched_at,
  };
}

module.exports = { normalizeRecord, parsePriceGbp };