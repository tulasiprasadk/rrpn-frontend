import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { env } from "./auth.js";

const { Pool } = pg;
let pool = null;
let tableReady = null;
const fallbackStoreFile = process.env.ADMIN_PRODUCT_STORE_FILE || "/tmp/rrpn-admin-products.json";

function isLocalDatabaseUrl(connectionString) {
  try {
    const parsed = new URL(connectionString);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return /(?:localhost|127\.0\.0\.1)(?::|\/)/i.test(connectionString);
  }
}

function getPool() {
  if (pool) return pool;

  const connectionString = env("DATABASE_URL");
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (process.env.VERCEL && isLocalDatabaseUrl(connectionString)) {
    throw new Error("Production DATABASE_URL points to localhost. Set it to a hosted Postgres connection string.");
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 8000,
  });

  return pool;
}

async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS admin_products (
        id BIGSERIAL PRIMARY KEY,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        title TEXT NOT NULL,
        price NUMERIC(12, 2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'approved',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).catch((error) => {
      tableReady = null;
      throw error;
    });
  }

  await tableReady;
}

function toProduct(row) {
  if (!row) return null;

  return normalizeProduct({
    ...(row.payload || {}),
    id: `admin-${row.id}`,
    storeId: row.id,
    title: row.title,
    name: row.title,
    price: Number(row.price || 0),
    basePrice: Number(row.price || 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: {
      ...((row.payload || {}).metadata || {}),
      source: "admin_products",
    },
  });
}

function getDbId(id) {
  return String(id || "").replace(/^admin-/, "");
}

function isAdminProductId(id) {
  return /^admin-\d+$/.test(String(id || ""));
}

function normalizeProduct(product) {
  const categoryName =
    product.Category?.name ||
    product.category ||
    product.categoryName ||
    "Groceries";

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

function validateProductData(data = {}) {
  const title = String(data.title || data.name || "").trim();
  if (!title) throw new Error("Product title is required");

  const price = Number(data.price ?? data.basePrice ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Valid product price is required");
  }

  return { title, price };
}

function buildProductPayload(data = {}) {
  const { title, price } = validateProductData(data);
  const categoryId = data.CategoryId || data.categoryId || 1;
  const categoryName = data.categoryName || data.category || data.Category?.name || "Groceries";

  return normalizeProduct({
    ...data,
    title,
    name: title,
    price,
    basePrice: price,
    status: data.status || "approved",
    CategoryId: categoryId,
    categoryId,
    category: categoryName,
    Category: data.Category || {
      id: categoryId,
      name: categoryName,
    },
  });
}

async function readFallbackProducts() {
  try {
    const raw = await fs.readFile(fallbackStoreFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeProduct) : [];
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Fallback product store read failed:", error.message);
    }
    return [];
  }
}

async function writeFallbackProducts(products) {
  await fs.mkdir(path.dirname(fallbackStoreFile), { recursive: true });
  await fs.writeFile(
    fallbackStoreFile,
    JSON.stringify(products.map(normalizeProduct), null, 2),
    "utf8"
  );
}

async function createFallbackProduct(data = {}, error) {
  const now = new Date().toISOString();
  const product = normalizeProduct({
    ...buildProductPayload(data),
    id: data.id || `admin-local-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    metadata: {
      ...(data.metadata || {}),
      source: "fallback_product_store",
      warning: "Database unavailable; saved in fallback store.",
      databaseError: error?.message || "",
    },
  });
  const rows = await readFallbackProducts();
  await writeFallbackProducts([product, ...rows.filter((item) => item.id !== product.id)]);
  return product;
}

async function updateFallbackProduct(id, data = {}, error) {
  const rows = await readFallbackProducts();
  const current = rows.find((item) => String(item.id) === String(id));
  if (!current && !Object.keys(data || {}).length) return null;

  const next = normalizeProduct({
    ...(current || {}),
    ...data,
    id,
    title: data.title || data.name || current?.title || current?.name || "Product",
    name: data.name || data.title || current?.name || current?.title || "Product",
    price: Number(data.price ?? data.basePrice ?? current?.price ?? 0),
    basePrice: Number(data.basePrice ?? data.price ?? current?.basePrice ?? current?.price ?? 0),
    createdAt: current?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      ...(current?.metadata || {}),
      ...(data.metadata || {}),
      source: "fallback_product_store",
      warning: "Database unavailable; saved in fallback store.",
      databaseError: error?.message || "",
    },
  });

  await writeFallbackProducts([next, ...rows.filter((item) => String(item.id) !== String(id))]);
  return next;
}

export async function listStoredProducts() {
  try {
    await ensureTable();
    const result = await getPool().query(
      "SELECT * FROM admin_products WHERE status != 'deleted' ORDER BY id DESC"
    );
    const fallbackProducts = (await readFallbackProducts()).filter((item) => item.status !== "deleted");
    return [...result.rows.map(toProduct), ...fallbackProducts];
  } catch (error) {
    console.warn("Stored products unavailable:", error.message);
    return (await readFallbackProducts()).filter((item) => item.status !== "deleted");
  }
}

export async function getStoredProductById(id) {
  if (!isAdminProductId(id)) {
    return (await readFallbackProducts()).find((item) => String(item.id) === String(id)) || null;
  }

  try {
    await ensureTable();
    const result = await getPool().query(
      "SELECT * FROM admin_products WHERE id = $1 AND status != 'deleted' LIMIT 1",
      [getDbId(id)]
    );
    return (
      toProduct(result.rows[0]) ||
      (await readFallbackProducts()).find((item) => String(item.id) === String(id)) ||
      null
    );
  } catch (error) {
    console.warn("Stored product lookup unavailable:", error.message);
    return (await readFallbackProducts()).find((item) => String(item.id) === String(id)) || null;
  }
}

export async function createStoredProduct(data = {}) {
  const payload = buildProductPayload(data);

  try {
    await ensureTable();
    const result = await getPool().query(
      `INSERT INTO admin_products (payload, title, price, status)
       VALUES ($1::jsonb, $2, $3, $4)
       RETURNING *`,
      [JSON.stringify(payload), payload.title, payload.price, payload.status]
    );

    return toProduct(result.rows[0]);
  } catch (error) {
    console.warn("Database product create unavailable, using fallback store:", error.message);
    return createFallbackProduct(payload, error);
  }
}

export async function updateStoredProduct(id, data = {}) {
  if (!isAdminProductId(id)) {
    return updateFallbackProduct(id, data);
  }

  try {
    await ensureTable();

    const currentResult = await getPool().query(
      "SELECT * FROM admin_products WHERE id = $1 AND status != 'deleted' LIMIT 1",
      [getDbId(id)]
    );

    const current = currentResult.rows[0];
    if (!current) return updateFallbackProduct(id, data);

    const nextPayload = {
      ...(current.payload || {}),
      ...data,
    };
    const title = String(nextPayload.title || nextPayload.name || current.title).trim();
    const price = Number(nextPayload.price ?? current.price ?? 0);
    nextPayload.title = title;
    nextPayload.name = title;
    nextPayload.price = price;
    nextPayload.basePrice = price;

    const result = await getPool().query(
      `UPDATE admin_products
         SET payload = $2::jsonb, title = $3, price = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [getDbId(id), JSON.stringify(nextPayload), title, price]
    );

    return toProduct(result.rows[0]);
  } catch (error) {
    console.warn("Database product update unavailable, using fallback store:", error.message);
    return updateFallbackProduct(id, data, error);
  }
}

export async function deleteStoredProduct(id) {
  if (isAdminProductId(id)) {
    try {
      await ensureTable();
      const result = await getPool().query(
        `UPDATE admin_products
           SET status = 'deleted', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [getDbId(id)]
      );

      if (result.rows[0]) return true;
    } catch (error) {
      console.warn("Database product delete unavailable, using fallback store:", error.message);
    }

    const rows = await readFallbackProducts();
    const nextRows = rows.filter((item) => String(item.id) !== String(id));
    if (nextRows.length === rows.length) return false;
    await writeFallbackProducts(nextRows);
    return true;
  }

  const deletedAt = new Date().toISOString();
  try {
    await ensureTable();
    await getPool().query(
      `INSERT INTO admin_products (payload, title, price, status)
       VALUES ($1::jsonb, $2, 0, 'deleted')`,
      [
        JSON.stringify({
          deletedProductId: String(id),
          title: `Deleted catalog product ${id}`,
          status: "deleted",
          deletedAt,
        }),
        `Deleted catalog product ${id}`,
      ]
    );
    return true;
  } catch (error) {
    console.warn("Database catalog delete unavailable, using fallback store:", error.message);
  }

  const rows = await readFallbackProducts();
  const tombstone = normalizeProduct({
    id: `deleted-${id}`,
    title: `Deleted catalog product ${id}`,
    price: 0,
    status: "deleted",
    metadata: {
      source: "fallback_product_store",
      deletedProductId: String(id),
      deletedAt,
    },
  });
  await writeFallbackProducts([tombstone, ...rows.filter((item) => item.metadata?.deletedProductId !== String(id))]);
  return true;
}

export async function listDeletedProductIds() {
  const deletedIds = new Set();

  try {
    await ensureTable();
    const result = await getPool().query(
      `SELECT payload->>'deletedProductId' AS deleted_product_id
         FROM admin_products
        WHERE status = 'deleted'
          AND payload ? 'deletedProductId'`
    );
    result.rows.forEach((row) => {
      if (row.deleted_product_id) deletedIds.add(String(row.deleted_product_id));
    });
  } catch (error) {
    console.warn("Deleted product lookup unavailable:", error.message);
  }

  const fallbackRows = await readFallbackProducts();
  fallbackRows.forEach((item) => {
    const deletedProductId = item.metadata?.deletedProductId || item.deletedProductId;
    if (item.status === "deleted" && deletedProductId) {
      deletedIds.add(String(deletedProductId));
    }
  });

  return deletedIds;
}
