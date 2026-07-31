import crypto from "node:crypto";
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
      CREATE TABLE IF NOT EXISTS page_orders (
        id BIGSERIAL PRIMARY KEY,
        order_ref TEXT UNIQUE NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL DEFAULT '',
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'created',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_submission JSONB,
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

function buildRef() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RRN-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function normalizeItems(data = {}) {
  const payloadItems = Array.isArray(data.items) ? data.items : [];
  if (payloadItems.length) {
    return payloadItems.map((item) => ({
      id: item.id || item.productId || item.product_id || item.sku || null,
      title: item.title || item.name || item.productName || "Product",
      price: Number(item.price || item.basePrice || item.amount || 0),
      quantity: Number(item.quantity || item.qty || 1),
      category: item.category || item.categoryName || item.Category?.name || "",
      unit: item.unit || "",
    }));
  }

  return [{
    id: data.productId || null,
    title: data.productTitle || data.title || "Product",
    price: Number(data.price || 0),
    quantity: Number(data.qty || data.quantity || 1),
    category: data.category || "",
    unit: data.unit || "",
  }];
}

function amountFromItems(items) {
  return items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
}

function toOrder(row) {
  if (!row) return null;

  return {
    id: row.order_ref,
    orderId: row.order_ref,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    totalAmount: Number(row.total_amount || 0),
    status: row.status,
    paymentStatus: row.payment_status,
    paymentSubmission: row.payment_submission || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.payload || {}),
  };
}

export async function createPageOrder(data = {}, isGuest = false) {
  await ensureTable();

  const customerName = String(data.customerName || data.name || "").trim();
  const customerPhone = String(data.customerPhone || data.phone || "").trim();
  const customerAddress = String(data.customerAddress || data.address || "").trim();
  if (!customerName || !customerPhone || !customerAddress) {
    throw new Error("Name, phone, and delivery address are required");
  }

  const items = normalizeItems(data);
  const totalAmount = Number(data.totalAmount || amountFromItems(items) || 0);
  const payload = {
    ...data,
    isGuest,
    items,
  };

  const result = await getPool().query(
    `INSERT INTO page_orders (
       order_ref, payload, customer_name, customer_phone, customer_address, total_amount
     ) VALUES ($1, $2::jsonb, $3, $4, $5, $6)
     RETURNING *`,
    [buildRef(), JSON.stringify(payload), customerName, customerPhone, customerAddress, totalAmount]
  );

  return toOrder(result.rows[0]);
}

export async function getPageOrder(orderId) {
  await ensureTable();
  const result = await getPool().query(
    "SELECT * FROM page_orders WHERE order_ref = $1 LIMIT 1",
    [String(orderId || "")]
  );
  return toOrder(result.rows[0]);
}

export async function listPageOrders({ status = "", limit = 200 } = {}) {
  await ensureTable();

  const params = [];
  const where = [];
  if (status) {
    params.push(String(status));
    where.push(`status = $${params.length}`);
  }

  params.push(Math.max(1, Math.min(Number(limit || 200), 500)));
  const limitParam = `$${params.length}`;

  const result = await getPool().query(
    `SELECT *
       FROM page_orders
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC
      LIMIT ${limitParam}`,
    params
  );

  return result.rows.map(toOrder).filter(Boolean);
}

export async function updatePageOrderStatus(orderId, status, paymentStatus) {
  await ensureTable();

  const result = await getPool().query(
    `UPDATE page_orders
        SET status = $2,
            payment_status = COALESCE($3, payment_status),
            updated_at = NOW()
      WHERE order_ref = $1
      RETURNING *`,
    [String(orderId || ""), String(status || "created"), paymentStatus || null]
  );

  return toOrder(result.rows[0]);
}

export async function submitPageOrderPayment(orderId, paymentSubmission = {}) {
  await ensureTable();
  const result = await getPool().query(
    `UPDATE page_orders
       SET payment_status = 'submitted',
           status = 'payment_submitted',
           payment_submission = $2::jsonb,
           updated_at = NOW()
     WHERE order_ref = $1
     RETURNING *`,
    [String(orderId || ""), JSON.stringify(paymentSubmission)]
  );
  return toOrder(result.rows[0]);
}

export async function listPageOrderCustomers() {
  await ensureTable();

  const result = await getPool().query(`
    SELECT
      customer_phone,
      (ARRAY_AGG(customer_name ORDER BY created_at DESC))[1] AS customer_name,
      MIN(created_at) AS first_seen_at,
      MAX(created_at) AS last_seen_at,
      COUNT(*)::int AS orders_count,
      COALESCE(SUM(total_amount), 0) AS total_spent
    FROM page_orders
    GROUP BY customer_phone
    ORDER BY last_seen_at DESC
  `);

  return result.rows.map((row) => ({
    id: row.customer_phone || row.customer_name || `customer-${row.last_seen_at}`,
    name: row.customer_name || "Guest / Unnamed",
    mobile: row.customer_phone || "",
    email: "",
    createdAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    ordersCount: Number(row.orders_count || 0),
    totalSpent: Number(row.total_spent || 0),
    source: "page_orders",
  }));
}
