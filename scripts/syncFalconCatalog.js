const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://falconmotosiklet.com';
const OUTPUT = path.resolve(__dirname, '../frontend/src/data/falconMotors.js');
const CATEGORY_NAMES = {
  1: 'Cub',
  2: 'Classic',
  3: 'Scooter',
  4: 'Cross',
  5: 'Elektrikli Scooter',
  6: 'Üç Tekerli',
  7: 'Naked',
  8: 'Sport',
  9: 'Cruiser',
  10: 'Off-Road',
  11: 'Dört Tekerli',
  12: 'Elektrikli Bisiklet',
};

const decodeHtml = (value = '') => value
  .replace(/<br\s*\/?>/gi, ' / ')
  .replace(/<[^>]*>/g, '')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
  .replace(/&quot;/g, '"')
  .replace(/&apos;|&#039;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const absoluteUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}/${url.replace(/^\//, '')}`;
};

const getType = (category) => {
  if (category === 'Scooter') return 'scooter';
  if (['Off-Road'].includes(category)) return 'atv';
  if (['Üç Tekerli', 'Dört Tekerli', 'Elektrikli Scooter', 'Elektrikli Bisiklet'].includes(category)) return 'elektrikli';
  return 'motosiklet';
};

async function getHtml(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'DemirkanCatalogSync/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function parseCatalog(html) {
  const products = [];
  const gridRegex = /<div class="models-products-grid" data-category-id="(\d+)">([\s\S]*?)(?=<div class="models-products-grid"|<!-- Products Accordion|<\/section>)/g;
  for (const grid of html.matchAll(gridRegex)) {
    const category = CATEGORY_NAMES[grid[1]] || 'Diğer';
    const productRegex = /<a href="([^"]+\/urun\/[^"?#]+)" class="models-product-item[^"]*">([\s\S]*?)<\/a>/g;
    for (const match of grid[2].matchAll(productRegex)) {
      const link = absoluteUrl(match[1]);
      const body = match[2];
      const name = decodeHtml(body.match(/<span class="models-product-name">([\s\S]*?)<\/span>/i)?.[1]);
      if (!name) continue;
      const image = absoluteUrl(body.match(/<img[^>]+src="([^"]+)"/i)?.[1]);
      products.push({
        slug: link.split('/').pop(),
        link,
        name,
        category,
        cardImage: image,
        homePrice: decodeHtml(body.match(/<span class="models-product-price">([\s\S]*?)<\/span>/i)?.[1] || '') || null,
      });
    }
  }
  return [...new Map(products.map((product) => [product.link, product])).values()];
}

function parsePrices(html) {
  const prices = new Map();
  const rowRegex = /<tr class="price-row" data-product-url="([^"]+)">([\s\S]*?)<\/tr>/g;
  for (const row of html.matchAll(rowRegex)) {
    const cells = [...row[2].matchAll(/<td class="price">([\s\S]*?)<\/td>/g)]
      .map((cell) => decodeHtml(cell[1]))
      .map((price) => price.replace(/\s*₺$/, '').trim());
    prices.set(row[1], { cashPrice: cells[0] || null, installmentPrice: cells[1] || null });
  }
  return prices;
}

function parseDetail(product, html) {
  const detailHtml = html.slice(html.indexOf('<section class="productDetail">'));
  const model = decodeHtml(html.match(/product-hero-title__model">([\s\S]*?)<\/span>/i)?.[1]) || product.name;
  const slogan = decodeHtml(html.match(/product-hero-title__slogan">([\s\S]*?)<\/span>/i)?.[1]);
  const coverImage = absoluteUrl(html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1]) || product.cardImage;
  const specs = {};
  const specRegex = /<div class="item">\s*<b>([\s\S]*?)<\/b>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/g;
  for (const match of detailHtml.matchAll(specRegex)) {
    const key = decodeHtml(match[1]);
    const value = decodeHtml(match[2]);
    if (key && value) specs[key] = value;
  }

  const imageUrls = [...detailHtml.matchAll(/(?:src|data-img)="(https:\/\/falconmotosiklet\.com\/upload\/medya\/[^" ]+)"/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter((url) => !/\/compress\/(?:sm|md)\//.test(url));
  const gallery = [...new Set(imageUrls)].filter((url) => url !== coverImage).slice(0, 12);

  const colors = [...detailHtml.matchAll(/style="background-color:([^;]+);"[\s\S]{0,120}?data-img="([^"]+)"/gi)]
    .map((match, index) => ({ name: `Renk ${index + 1}`, image: absoluteUrl(match[2]) }))
    .filter((color, index, list) => list.findIndex((item) => item.image === color.image) === index);

  const cc = specs['Motor Hacmi'] || specs['Silindir Hacmi'] || specs['Motor Gücü'] || '';
  const hp = specs['Maksimum Güç'] || specs['Motor Gücü'] || '';
  const description = slogan || `${model}, Falcon ${product.category} koleksiyonunda yer alan bir modeldir.`;
  if (!Object.keys(specs).length) {
    specs.Kategori = product.category;
    if (cc) specs['Motor Hacmi'] = cc;
    if (hp) specs['Motor Gücü'] = hp;
    specs.Marka = 'Falcon';
  }

  return {
    id: `falcon-${product.slug}`,
    brand: 'Falcon',
    name: model,
    category: product.category,
    type: getType(product.category),
    cc,
    hp,
    price: product.cashPrice ? `${product.cashPrice} TL` : (product.homePrice ? `${product.homePrice.replace(/\s*TL$/i, '')} TL` : null),
    installmentPrice: product.installmentPrice ? `${product.installmentPrice} TL` : null,
    description,
    about: description,
    coverImage,
    gallery,
    colors,
    specs,
    sourceUrl: product.link,
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const result = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        result[index] = await mapper(items[index]);
        process.stdout.write('.');
      } catch (error) {
        console.warn(`\nAtlandı: ${items[index].link} (${error.message})`);
        result[index] = parseDetail(items[index], '');
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return result;
}

async function main() {
  const [homeHtml, priceHtml] = await Promise.all([
    getHtml(`${BASE_URL}/`),
    getHtml(`${BASE_URL}/fiyat-listesi`),
  ]);
  const priceMap = parsePrices(priceHtml);
  const catalog = parseCatalog(homeHtml).map((product) => ({ ...product, ...(priceMap.get(product.link) || {}) }));
  if (catalog.length < 40) throw new Error(`Beklenenden az Falcon modeli bulundu: ${catalog.length}`);
  const motors = await mapWithConcurrency(catalog, 6, async (product) => parseDetail(product, await getHtml(product.link)));
  const file = `// Bu dosya scripts/syncFalconCatalog.js ile Falcon resmi sitesinden üretilmiştir.\n// Kaynak: ${BASE_URL}/\n\nconst falconMotors = ${JSON.stringify(motors, null, 2)};\n\nexport default falconMotors;\n`;
  fs.writeFileSync(OUTPUT, file, 'utf8');
  console.log(`\n${motors.length} Falcon modeli yazıldı: ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
