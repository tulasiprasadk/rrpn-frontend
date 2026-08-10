import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const orderStoreFile = process.env.PAGE_ORDER_STORE_FILE || "/tmp/rrpn-page-orders.json";

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

function normalizeOrder(order = {}) {
  const id = order.orderId || order.id || buildRef();
  const items = normalizeItems(order);
  const totalAmount = Number(order.totalAmount || amountFromItems(items) || 0);
  const createdAt = order.createdAt || new Date().toISOString();

  return {
    ...order,
    id,
    orderId: id,
    customerName: String(order.customerName || order.name || "").trim(),
    customerPhone: String(order.customerPhone || order.phone || "").trim(),
    customerAddress: String(order.customerAddress || order.address || "").trim(),
    items,
    totalAmount,
    status: order.status || "created",
    paymentStatus: order.paymentStatus || "pending",
    paymentSubmission: order.paymentSubmission || null,
    createdAt,
    updatedAt: order.updatedAt || createdAt,
  };
}

async function readOrders() {
  try {
    const raw = await fs.readFile(orderStoreFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Order store read failed:", error.message);
    }
    return [];
  }
}

async function writeOrders(orders) {
  await fs.mkdir(path.dirname(orderStoreFile), { recursive: true });
  await fs.writeFile(
    orderStoreFile,
    JSON.stringify(orders.map(normalizeOrder), null, 2),
    "utf8"
  );
}

export async function createPageOrder(data = {}, isGuest = false) {
  const customerName = String(data.customerName || data.name || "").trim();
  const customerPhone = String(data.customerPhone || data.phone || "").trim();
  const customerAddress = String(data.customerAddress || data.address || "").trim();
  if (!customerName || !customerPhone || !customerAddress) {
    throw new Error("Name, phone, and delivery address are required");
  }

  const order = normalizeOrder({
    ...data,
    id: buildRef(),
    orderId: undefined,
    isGuest,
    customerName,
    customerPhone,
    customerAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const orders = await readOrders();
  await writeOrders([order, ...orders.filter((item) => item.orderId !== order.orderId)]);
  return order;
}

export async function getPageOrder(orderId) {
  const id = String(orderId || "");
  return (await readOrders()).find((order) => String(order.orderId) === id || String(order.id) === id) || null;
}

export async function listPageOrders({ status = "", limit = 200 } = {}) {
  const max = Math.max(1, Math.min(Number(limit || 200), 500));
  return (await readOrders())
    .filter((order) => !status || order.status === status)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, max);
}

export async function updatePageOrderStatus(orderId, status, paymentStatus) {
  const orders = await readOrders();
  const id = String(orderId || "");
  const index = orders.findIndex((order) => String(order.orderId) === id || String(order.id) === id);
  if (index < 0) return null;

  orders[index] = normalizeOrder({
    ...orders[index],
    status: status || orders[index].status || "created",
    paymentStatus: paymentStatus || orders[index].paymentStatus || "pending",
    updatedAt: new Date().toISOString(),
  });
  await writeOrders(orders);
  return orders[index];
}

export async function submitPageOrderPayment(orderId, paymentSubmission = {}) {
  const orders = await readOrders();
  const id = String(orderId || "");
  const index = orders.findIndex((order) => String(order.orderId) === id || String(order.id) === id);
  if (index < 0) return null;

  orders[index] = normalizeOrder({
    ...orders[index],
    status: "payment_submitted",
    paymentStatus: "submitted",
    paymentSubmission,
    updatedAt: new Date().toISOString(),
  });
  await writeOrders(orders);
  return orders[index];
}

export async function listPageOrderCustomers() {
  const customers = new Map();

  for (const order of await readOrders()) {
    const key = order.customerPhone || order.customerName || order.orderId;
    const current = customers.get(key);
    const next = {
      id: key,
      name: order.customerName || "Guest / Unnamed",
      mobile: order.customerPhone || "",
      email: order.customerEmail || order.email || "",
      createdAt: order.createdAt,
      lastSeenAt: order.createdAt,
      ordersCount: 1,
      totalSpent: Number(order.totalAmount || 0),
      source: "page_orders",
    };

    if (!current) {
      customers.set(key, next);
      continue;
    }

    current.ordersCount += 1;
    current.totalSpent += Number(order.totalAmount || 0);
    if (new Date(order.createdAt || 0) > new Date(current.lastSeenAt || 0)) {
      current.name = order.customerName || current.name;
      current.mobile = order.customerPhone || current.mobile;
      current.lastSeenAt = order.createdAt;
    }
    if (new Date(order.createdAt || 0) < new Date(current.createdAt || 0)) {
      current.createdAt = order.createdAt;
    }
  }

  return Array.from(customers.values())
    .sort((a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0));
}
