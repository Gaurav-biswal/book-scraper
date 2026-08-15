# Book Scraper

A polite scraper that collects book data from a practice sandbox site, turning messy HTML into clean, validated JSON.

## Target classification

- **Site:** [Books to Scrape](https://books.toscrape.com), a project of [toscrape.com](https://toscrape.com) (built by Zyte)
- **Why this site is appropriate:** toscrape.com explicitly describes itself as a web scraping sandbox, and Books to Scrape specifically as "a fictional bookstore that desperately wants to be scraped... a safe place for beginners learning web scraping." It exists for exactly this purpose — no real user data, no login walls, no commercial harm from being scraped.
- **Scope:** only the first 3 catalogue pages (60 books total) — not the entire 1000-item catalogue.
- **Data collected:** book title, price, availability, star rating, description, and product URL — all publicly displayed on each page, nothing hidden or gated.
- **robots.txt result:** `https://books.toscrape.com/robots.txt` returns a 404 Not Found — no robots file found. A missing file is not permission, just an absence of a stated rule; the actual permission comes from the site's own "desperately wants to be scraped" description above.

I will not reuse this code on another site without checking its rules and terms first.

## How to run

```bash
npm install
node src/index.js
```

This single command:
1. Fetches (or reads from cache) the first 3 catalogue pages
2. Discovers and visits all 60 unique book detail pages
3. Extracts, normalizes, and validates every record
4. Writes `output/books.json` (valid records) and `output/errors.json` (any that failed validation)
5. Writes `output/run-report.json` summarizing what happened

Re-running the command is safe — it reads from `cache/` instead of re-fetching, and produces the same 60 records every time (never duplicates).

## Record schema

Each entry in `output/books.json` has this shape, validated with Zod before storage:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Book title |
| `product_url` | string (URL) | Canonical identity of the record |
| `price_text` | string | Original price as shown, e.g. `"£51.77"` |
| `price_gbp` | number | Parsed numeric price, e.g. `51.77` |
| `availability_text` | string | e.g. `"In stock (22 available)"` |
| `rating_text` | string \| null | Star rating word, e.g. `"Three"` |
| `description` | string \| null | `null` when the book has no description on the page — never invented |
| `source_page` | string (URL) | Which catalogue page this book was discovered on |
| `fetched_at` | string (ISO datetime) | When this record was extracted |

Records that fail validation are written to `output/errors.json` with a reason, and never appear in `books.json`.

## Politeness rules this scraper follows

- **User-agent:** every real request identifies itself as `FlyRankInternshipA9/1.0 (+https://github.com/Gaurav-biswal/book-scraper)`, so a site owner could find this project in their logs.
- **Timeout:** every request gives up after 8 seconds rather than hanging forever.
- **Delay:** at least 500ms between real requests to the site (this project uses 600ms). Cached pages are read from disk and add no delay, since they never leave the machine.
- **Status check:** only a `200` response is treated as a real page. Anything else is a failed fetch, not HTML to parse.
- **Cache:** every page (3 catalogue pages + 60 book pages) is saved to `cache/` on first fetch. All later runs, including every run during development, read from that cache instead of re-contacting the site.
- **Retry rules:** a timeout or `5xx` server error gets one retry after a short wait. A `404` or `403` is never retried — the page doesn't exist, or the site said no; asking again would only be rude.
- **Scope discipline:** the crawler follows the site's own "next" link, but stops unconditionally after 3 catalogue pages, matching this project's stated scope — it does not silently expand to scrape the whole 1000-book catalogue.

## Why this project needed no browser

Every field this scraper collects — title, price, availability, rating, description — is present directly in the HTML the server sends on first load. There is no client-side JavaScript generating or hiding this content. Using a full browser (e.g. Playwright) here would only add cost: slower requests, more memory, and a heavier dependency, for data a plain HTTP request already receives in full.

## Sample run report

A real `output/run-report.json` from a completed run:

```json
{
  "start_time": "2026-08-15T07:39:05.240Z",
  "duration_ms": 401,
  "catalogue_pages_fetched": 3,
  "cache_hits": 0,
  "pages_fetched_from_network": 0,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0,
  "failures": []
}
```

This project's failure handling was also proven against a deliberately broken page: with one fake book URL added to the list on purpose, the run still finished, `books.json` still held the 60 good records, and `run-report.json` correctly reported `"failed_pages": 1` with the reason (`HTTP 404`) — before the fake URL was removed again for this clean, final submission.

## Ethics note

This project only touches a site explicitly built for scraping practice, with no real user data behind it. In general, I follow these rules for any future scraping work: prefer an official API when one exists rather than scraping HTML; never attempt to bypass logins, paywalls, CAPTCHAs, or IP blocks — those are the site telling you no; and collect only the specific data actually needed for the task, not everything reachable.

## Honest limitation

This scraper's retry logic is intentionally simple — one fixed-delay retry on a timeout or 5xx, no exponential backoff, and it doesn't yet read a `Retry-After` header if a site provides one. That's a deliberate scope choice for this stage; a production version (and next week's assignment) would add proper backoff and structured logging.

## Project structure

```
book-scraper/
├── src/
│   ├── fetch.js       # polite HTTP fetch: user-agent, timeout, retries, caching
│   ├── discover.js    # finds all 3 catalogue pages and 60 unique book URLs
│   ├── extract.js     # visits each book page, extracts the 8 raw fields
│   ├── normalize.js   # cleans price_text into price_gbp
│   ├── schema.js      # Zod schema defining a valid record
│   ├── store.js       # validates, dedupes, writes books.json / errors.json
│   ├── report.js      # writes run-report.json
│   └── index.js       # orchestrates the full pipeline
├── cache/             # saved HTML (git-ignored, local only)
├── output/
│   ├── books.json
│   ├── errors.json
│   └── run-report.json
└── README.md
```