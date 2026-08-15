# Book Scraper

A polite scraper that collects book data from a practice sandbox site, turning messy HTML into clean, validated JSON.

## Target classification

- **Site:** [Books to Scrape](https://books.toscrape.com), a project of [toscrape.com](https://toscrape.com) (built by Zyte)
- **Why this site is appropriate:** toscrape.com explicitly describes itself as a web scraping sandbox, and Books to Scrape specifically as "a fictional bookstore that desperately wants to be scraped... a safe place for beginners learning web scraping." It exists for exactly this purpose — no real user data, no login walls, no commercial harm from being scraped.
- **Scope:** only the first 3 catalogue pages (60 books total) — not the entire 1000-item catalogue.
- **Data collected:** book title, price, availability, star rating, description, and product URL — all publicly displayed on each page, nothing hidden or gated.
- **robots.txt result:** `https://books.toscrape.com/robots.txt` returns a 404 Not Found — no robots file found. A missing file is not permission, just an absence of a stated rule; the actual permission comes from the site's own "desperately wants to be scraped" description above.

I will not reuse this code on another site without checking its rules and terms first.
