import fs from "node:fs";
import path from "node:path";

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/sync-crackers-from-csv.mjs <csv-path>");
  process.exit(1);
}

const catalogPath = path.resolve("backend/products.json");
const sourceJsonPath = path.resolve("src/data/crackers.json");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    })
    .filter((row) => row.title && row.title.trim());
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueId(base, seen) {
  let id = base || "cracker";
  let suffix = 2;
  while (seen.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  seen.add(id);
  return id;
}

function cleanText(value) {
  return String(value || "")
    .replace(/[\u0091\u2018]/g, "'")
    .replace(/[\u0092\u2019]/g, "'")
    .replace(/[\u0093\u201C]/g, "\"")
    .replace(/[\u0094\u201D]/g, "\"")
    .replace(/[\u0096\u2013]/g, "-")
    .replace(/[\u0097\u2014]/g, "-")
    .trim();
}

const csvBuffer = fs.readFileSync(csvPath);
let csv = csvBuffer.toString("utf8");
if (csv.includes("\uFFFD")) {
  csv = new TextDecoder("windows-1252").decode(csvBuffer);
}
const rows = parseCsv(csv);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const products = Array.isArray(catalog.value) ? catalog.value : catalog;
const now = new Date().toISOString();
const seenIds = new Set();

const crackerRows = rows.map((row) => {
  const title = cleanText(row.title);
  const variety = cleanText(row.variety || "Crackers");
  const subVariety = cleanText(row.subVariety) || null;
  const price = Number(row.price || 0);
  const unit = cleanText(row.unit || "BOX");
  const categoryId = Number(row.categoryId || 6);
  const categoryName = cleanText(row.categoryName || "Crackers");
  const id = uniqueId(`cracker-${slugify(variety)}-${slugify(title)}`, seenIds);

  return {
    id,
    title,
    titleKannada: null,
    description: cleanText(row.description) || `${variety} cracker product.`,
    descriptionKannada: null,
    price,
    basePrice: price,
    variety,
    subVariety,
    unit: unit.toLowerCase(),
    sku: id,
    supplierId: null,
    isService: false,
    deliveryAvailable: true,
    isTemplate: false,
    metadata: {
      sku: id,
      source: "cracker_price_upload_2026",
    },
    status: "approved",
    createdAt: now,
    updatedAt: now,
    CategoryId: categoryId,
    Category: {
      id: categoryId,
      name: categoryName,
    },
  };
});

const nonCrackers = products.filter(
  (product) => String(product.Category?.name || product.category || "").toLowerCase() !== "crackers"
);

const nextCatalog = Array.isArray(catalog.value)
  ? { ...catalog, value: [...crackerRows, ...nonCrackers] }
  : [...crackerRows, ...nonCrackers];

const groupedSource = Object.values(
  crackerRows.reduce((groups, product) => {
    if (!groups[product.variety]) {
      groups[product.variety] = { category: product.variety, products: [] };
    }
    groups[product.variety].products.push({
      id: product.id.replace(/^cracker-/, ""),
      name: product.title,
      kn: product.titleKannada,
      price: product.price,
      unit: product.unit.toUpperCase(),
    });
    return groups;
  }, {})
);

fs.writeFileSync(catalogPath, `${JSON.stringify(nextCatalog, null, 2)}\n`, "utf8");
fs.writeFileSync(sourceJsonPath, `${JSON.stringify(groupedSource, null, 2)}\n`, "utf8");

console.log(`Imported ${crackerRows.length} cracker products from ${csvPath}`);
console.log(`Updated ${catalogPath}`);
console.log(`Updated ${sourceJsonPath}`);
