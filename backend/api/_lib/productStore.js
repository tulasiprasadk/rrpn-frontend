import pg from "pg";
import { env } from "./auth.js";

const { Pool } = pg;
let pool = null;
let tableReady = null;

function getPool() {
  if (pool) return pool;

  const connectionString = env("DATABASE_URL");
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
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
    id: row.id,
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

export async function listStoredProducts() {
  try {
    await ensureTable();
    const result = await getPool().query(
      "SELECT * FROM admin_products WHERE status != 'deleted' ORDER BY id DESC"
    );
    return result.rows.map(toProduct);
  } catch (error) {
    console.warn("Stored products unavailable:", error.message);
    return [];
  }
}

export async function getStoredProductById(id) {
  try {
    await ensureTable();
    const result = await getPool().query(
      "SELECT * FROM admin_products WHERE id = $1 AND status != 'deleted' LIMIT 1",
      [String(id)]
    );
    return toProduct(result.rows[0]);
  } catch (error) {
    console.warn("Stored product lookup unavailable:", error.message);
    return null;
  }
}

export async function createStoredProduct(data = {}) {
  await ensureTable();

  const title = String(data.title || data.name || "").trim();
  if (!title) throw new Error("Product title is required");

  const price = Number(data.price ?? data.basePrice ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Valid product price is required");
  }

  const payload = {
    ...data,
    title,
    name: title,
    price,
    basePrice: price,
    status: data.status || "approved",
    CategoryId: data.CategoryId || data.categoryId || 1,
    Category: data.Category || {
      id: data.CategoryId || data.categoryId || 1,
      name: data.categoryName || data.category || "Groceries",
    },
  };

  const result = await getPool().query(
    `INSERT INTO admin_products (payload, title, price, status)
     VALUES ($1::jsonb, $2, $3, $4)
     RETURNING *`,
    [JSON.stringify(payload), title, price, payload.status]
  );

  return toProduct(result.rows[0]);
}

export async function updateStoredProduct(id, data = {}) {
  await ensureTable();

  const currentResult = await getPool().query(
    "SELECT * FROM admin_products WHERE id = $1 AND status != 'deleted' LIMIT 1",
    [String(id)]
  );

  const current = currentResult.rows[0];
  if (!current) return null;

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
    [String(id), JSON.stringify(nextPayload), title, price]
  );

  return toProduct(result.rows[0]);
}

export async function deleteStoredProduct(id) {
  await ensureTable();
  const result = await getPool().query(
    `UPDATE admin_products
       SET status = 'deleted', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [String(id)]
  );

  return Boolean(result.rows[0]);
}
