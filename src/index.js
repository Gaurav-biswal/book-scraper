const { politeFetch } = require('./fetch');

const BASE_URL = 'https://books.toscrape.com';

async function main() {
  const url = `${BASE_URL}/catalogue/page-1.html`;
  const html = await politeFetch(url, 'catalogue-page-1.html');
  console.log('Done. HTML length:', html.length);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});