import fs from "node:fs/promises";
import { getStoredProductById, listDeletedProductIds, listStoredProducts } from "./productStore.js";

let catalogCache = null;

export async function getCatalog() {
  if (catalogCache) return catalogCache;

  const file = new URL("../../products.json", import.meta.url);
  const buffer = await fs.readFile(file);

  const raw = decodeJsonBuffer(buffer);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse products.json:", err);
    return [];
  }

  const rows = Array.isArray(parsed?.value)
    ? parsed.value
    : Array.isArray(parsed)
    ? parsed
    : [];

  catalogCache = rows.map(normalizeProduct);
  return catalogCache;
}

function decodeJsonBuffer(buffer) {
  // UTF-16 LE
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le");
  }

  // UTF-16 BE
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.alloc(buffer.length - 2);
    for (let i = 2; i < buffer.length; i += 2) {
      swapped[i - 2] = buffer[i + 1];
      swapped[i - 1] = buffer[i];
    }
    return swapped.toString("utf16le");
  }

  // UTF-8
  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

export async function getProducts(query = {}) {
  const rows = await getCatalog();
  const storedRows = await listStoredProducts();
  const deletedProductIds = await listDeletedProductIds();

  const q = String(query.q || query.search || "").trim().toLowerCase();
  const categoryId = String(query.categoryId || "").trim();
  const category = String(query.category || "").trim().toLowerCase();
  const limit = Math.max(1, Math.min(Number(query.limit || 50000), 50000));

  const storedById = new Map(storedRows.map((product) => [String(product.id), product]));
  const catalogRows = rows
    .filter((product) => !deletedProductIds.has(String(product.id)))
    .map((product) => storedById.get(String(product.id)) || product);
  const catalogIds = new Set(rows.map((product) => String(product.id)));
  const combinedRows = [
    ...storedRows.filter((product) => !catalogIds.has(String(product.id))),
    ...catalogRows,
  ];

  const filteredRows = combinedRows
    .filter((product) => product.status !== "rejected")
    .filter((product) => {
      if (!q) return true;
      return [
        product.title,
        product.name,
        product.description,
        product.variety,
        product.subVariety,
        product.Category?.name,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(q)
        );
    })
    .filter(
      (product) =>
        !categoryId ||
        String(product.CategoryId || product.categoryId || "") === categoryId
    )
    .filter(
      (product) =>
        !category ||
        String(product.Category?.name || product.category || "")
          .toLowerCase()
          .includes(category)
    )
    .slice(0, limit);

  return filteredRows;
}

export async function getProductById(id) {
  const deletedProductIds = await listDeletedProductIds();
  if (deletedProductIds.has(String(id))) return null;

  const rows = await getCatalog();
  return await getStoredProductById(id) || rows.find((p) => String(p.id) === String(id)) || null;
}

export async function getCategories() {
  const rows = await getCatalog();
  const byId = new Map();

  for (const product of rows) {
    const category = product.Category || {};
    const id =
      category.id ||
      product.CategoryId ||
      product.categoryId ||
      category.name ||
      "general";

    const name = category.name || product.category || "General";

    if (!byId.has(String(id))) {
      byId.set(String(id), { id, name });
    }
  }

  return [...byId.values()].sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
}

export function normalizeProduct(product) {
  const categoryName =
    product.Category?.name ||
    product.category ||
    product.categoryName ||
    "General";

  const categoryId =
    product.Category?.id ||
    product.CategoryId ||
    product.categoryId ||
    categoryName;

  return {
    ...product,
    name: product.name || product.title,
    title: product.title || product.name || "Product",
    price: Number(product.price ?? product.basePrice ?? 0),
    basePrice: Number(product.basePrice ?? product.price ?? 0),
    CategoryId: categoryId,
    categoryId,
    category: categoryName,
    Category: {
      id: categoryId,
      name: categoryName,
      ...(product.Category || {}),
    },
  };
}
