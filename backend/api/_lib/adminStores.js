import fs from "node:fs/promises";
import path from "node:path";
import { getProductById, getProducts } from "./catalog.js";

const supplierStoreFile = process.env.ADMIN_SUPPLIER_STORE_FILE || "/tmp/rrpn-suppliers.json";
const productSupplierStoreFile = process.env.ADMIN_PRODUCT_SUPPLIER_STORE_FILE || "/tmp/rrpn-product-suppliers.json";
const configStoreFile = process.env.ADMIN_CONFIG_STORE_FILE || "/tmp/rrpn-admin-config.json";
const adStoreFile = process.env.ADMIN_AD_STORE_FILE || "/tmp/rrpn-admin-ads.json";
const customerStoreFile = process.env.ADMIN_CUSTOMER_STORE_FILE || "/tmp/rrpn-customers.json";

const defaultConfig = {
  platform_commission: 15,
  platform_fee: 0,
  delivery_fee: 0,
  transport_fee: 0,
  min_order_amount: 0,
};

const defaultAds = [
  { id: "fallback:scrolling:1", title: "iChase Fitness", imageUrl: "/images/ads/ichase.png", targetUrl: "https://vchase.in", sourceType: "site_default", placement: "scrolling_ads", active: true, text: "Tap to explore" },
  { id: "fallback:scrolling:2", title: "VChase Marketing", imageUrl: "/images/ads/vchase.png", targetUrl: "https://vchase.in", sourceType: "site_default", placement: "scrolling_ads", active: true, text: "Tap to explore" },
  { id: "fallback:scrolling:3", title: "RR Nagar", imageUrl: "/images/ads/rrnagar.png", targetUrl: "https://rrnagar.com", sourceType: "site_default", placement: "scrolling_ads", active: true, text: "Tap to explore" },
  { id: "fallback:scrolling:4", title: "Renee Vet", imageUrl: "/images/ads/reneevet.png", targetUrl: "https://thevetbuddy.com", sourceType: "site_default", placement: "scrolling_ads", active: true, text: "Tap to explore" },
  { id: "fallback:mega-left:1", title: "iChase Fitness", imageUrl: "/images/ads/ichase.png", targetUrl: "https://vchase.in", sourceType: "site_default", placement: "mega_ads_left", active: true, text: "Fitness and wellness" },
  { id: "fallback:mega-left:2", title: "RR Nagar", imageUrl: "/images/ads/rrnagar.png", targetUrl: "https://rrnagar.com", sourceType: "site_default", placement: "mega_ads_left", active: true, text: "Local shopping and services" },
  { id: "fallback:mega-right:1", title: "VChase Marketing", imageUrl: "/images/ads/vchase.png", targetUrl: "https://vchase.in", sourceType: "site_default", placement: "mega_ads_right", active: true, text: "Marketing and branding support" },
  { id: "fallback:mega-right:2", title: "Renee Vet", imageUrl: "/images/ads/reneevet.png", targetUrl: "https://thevetbuddy.com", sourceType: "site_default", placement: "mega_ads_right", active: true, text: "Pet care and vet services" },
  { id: "fallback:mega-right:3", title: "Gephyr", imageUrl: "/images/ads/gephyr.png", targetUrl: "https://rrnagar.com", sourceType: "site_default", placement: "mega_ads_right", active: true, text: "Discover local business offers" },
  { id: "fallback:checkout:1", title: "RR Nagar", imageUrl: "/images/ads/rrnagar.png", targetUrl: "https://rrnagar.com", sourceType: "site_default", placement: "checkout_ads", active: true, text: "Shop local products and services" },
  { id: "fallback:checkout:2", title: "iChase Fitness", imageUrl: "/images/ads/ichase.png", targetUrl: "https://vchase.in", sourceType: "site_default", placement: "checkout_ads", active: true, text: "Fitness and wellness around you" },
];

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Store read failed for ${file}:`, error.message);
    }
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

function normalizeSupplier(supplier = {}) {
  const now = new Date().toISOString();
  const id = String(supplier.id || supplier._id || `supplier-${Date.now()}`);
  return {
    ...supplier,
    id,
    name: supplier.name || supplier.ownerName || supplier.businessName || "Supplier",
    ownerName: supplier.ownerName || supplier.name || "",
    businessName: supplier.businessName || supplier.shopName || supplier.name || "",
    email: supplier.email || "",
    phone: supplier.phone || supplier.phoneNumber || "",
    address: supplier.address || supplier.location || "",
    status: supplier.status || "approved",
    createdAt: supplier.createdAt || now,
    updatedAt: supplier.updatedAt || supplier.createdAt || now,
  };
}

function normalizeAssignment(row = {}) {
  return {
    productId: String(row.productId || ""),
    supplierId: String(row.supplierId || ""),
    price: row.price === "" || row.price == null ? null : Number(row.price),
    stock: Number(row.stock || 0),
    margin: row.margin === "" || row.margin == null ? null : Number(row.margin),
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
  };
}

function normalizeCustomer(customer = {}) {
  const now = new Date().toISOString();
  const id = String(customer.id || customer.sub || customer.email || customer.mobile || `customer-${Date.now()}`);
  return {
    ...customer,
    id,
    name: customer.name || customer.customerName || customer.email || customer.mobile || "Customer",
    email: customer.email || customer.customerEmail || "",
    mobile: customer.mobile || customer.phone || customer.customerPhone || "",
    picture: customer.picture || null,
    role: customer.role || "user",
    createdAt: customer.createdAt || now,
    updatedAt: now,
    lastSeenAt: now,
    source: customer.source || "auth",
  };
}

export async function listCustomers() {
  const rows = await readJson(customerStoreFile, []);
  return Array.isArray(rows) ? rows.map(normalizeCustomer) : [];
}

export async function upsertCustomer(data = {}) {
  const customers = await listCustomers();
  const current = customers.find((item) =>
    String(item.id) === String(data.id || "") ||
    (item.email && item.email === data.email) ||
    (item.mobile && item.mobile === data.mobile)
  );
  const customer = normalizeCustomer({
    ...(current || {}),
    ...data,
    id: current?.id || data.id,
    createdAt: current?.createdAt,
  });

  await writeJson(customerStoreFile, [
    customer,
    ...customers.filter((item) => String(item.id) !== String(customer.id)),
  ]);
  return customer;
}

export async function listSuppliers() {
  const rows = await readJson(supplierStoreFile, []);
  return Array.isArray(rows)
    ? rows.map(normalizeSupplier).filter((item) => item.status !== "deleted")
    : [];
}

export async function getSupplier(id) {
  return (await listSuppliers()).find((item) => String(item.id) === String(id)) || null;
}

export async function upsertSupplier(data = {}) {
  const suppliers = await listSuppliers();
  const supplier = normalizeSupplier({
    ...data,
    id: data.id || `supplier-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(supplierStoreFile, [
    supplier,
    ...suppliers.filter((item) => String(item.id) !== String(supplier.id)),
  ]);
  return supplier;
}

export async function updateSupplier(id, data = {}) {
  const suppliers = await listSuppliers();
  const current = suppliers.find((item) => String(item.id) === String(id));
  if (!current) return null;

  const supplier = normalizeSupplier({
    ...current,
    ...data,
    id: current.id,
    updatedAt: new Date().toISOString(),
  });
  await writeJson(supplierStoreFile, [
    supplier,
    ...suppliers.filter((item) => String(item.id) !== String(id)),
  ]);
  return supplier;
}

export async function deleteSupplier(id) {
  const suppliers = await listSuppliers();
  const next = suppliers.filter((item) => String(item.id) !== String(id));
  if (next.length === suppliers.length) return false;
  await writeJson(supplierStoreFile, next);
  return true;
}

async function listAssignments() {
  const rows = await readJson(productSupplierStoreFile, []);
  return Array.isArray(rows) ? rows.map(normalizeAssignment) : [];
}

async function writeAssignments(rows) {
  await writeJson(productSupplierStoreFile, rows.map(normalizeAssignment));
}

export async function listProductSuppliers(productId) {
  const suppliers = await listSuppliers();
  const config = await readConfig();
  const defaultMargin = Number(config.platform_commission ?? 15);
  const rows = (await listAssignments()).filter((row) => row.productId === String(productId));

  return rows
    .map((row) => {
      const supplier = suppliers.find((item) => String(item.id) === row.supplierId);
      if (!supplier) return null;
      return {
        ...supplier,
        ProductSupplier: {
          productId: row.productId,
          supplierId: row.supplierId,
          price: row.price,
          stock: row.stock,
          margin: row.margin ?? defaultMargin,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
      };
    })
    .filter(Boolean);
}

export async function assignProductSupplier(productId, data = {}) {
  const supplierId = String(data.supplierId || "");
  if (!supplierId) throw new Error("Supplier is required");

  const supplier = await getSupplier(supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const product = await getProductById(productId);
  if (!product) throw new Error("Product not found");

  const config = await readConfig();
  const rows = await listAssignments();
  const assignment = normalizeAssignment({
    productId,
    supplierId,
    price: data.price,
    stock: data.stock,
    margin: data.margin ?? config.platform_commission ?? 15,
    updatedAt: new Date().toISOString(),
  });

  await writeAssignments([
    assignment,
    ...rows.filter((row) => !(row.productId === String(productId) && row.supplierId === supplierId)),
  ]);
  return {
    ...supplier,
    ProductSupplier: assignment,
  };
}

export async function removeProductSupplier(productId, supplierId) {
  const rows = await listAssignments();
  const next = rows.filter((row) => !(row.productId === String(productId) && row.supplierId === String(supplierId)));
  if (next.length === rows.length) return false;
  await writeAssignments(next);
  return true;
}

export async function listSupplierProducts(supplierId) {
  const config = await readConfig();
  const defaultMargin = Number(config.platform_commission ?? 15);
  const rows = (await listAssignments()).filter((row) => row.supplierId === String(supplierId));
  const products = [];
  for (const row of rows) {
    const product = await getProductById(row.productId);
    if (product) {
      products.push({
        ...product,
        supplierPrice: row.price,
        supplierStock: row.stock,
        supplierMargin: row.margin ?? defaultMargin,
      });
    }
  }
  return products;
}

export async function getSupplierStats(supplierId) {
  const products = await listSupplierProducts(supplierId);
  return {
    supplierId,
    productsCount: products.length,
    activeProducts: products.length,
    totalStock: products.reduce((sum, product) => sum + Number(product.supplierStock || 0), 0),
    totalRevenue: 0,
    ordersCount: 0,
  };
}

export async function readConfig() {
  const stored = await readJson(configStoreFile, {});
  return {
    ...defaultConfig,
    ...(stored && typeof stored === "object" ? stored : {}),
  };
}

export async function updateConfigValue(key, data = {}) {
  const configs = await readConfig();
  const value = Object.prototype.hasOwnProperty.call(data, "value") ? data.value : data;
  configs[key] = value;
  await writeJson(configStoreFile, configs);
  return { key, value, configs };
}

export async function applyConfiguredMargin(data = {}) {
  const supplierPrice = Number(data.supplier_price ?? data.supplierPrice);
  if (!Number.isFinite(supplierPrice) || supplierPrice < 0) return data;

  const explicitPlatformPrice = Number(data.platform_price ?? data.platformPrice);
  if (Number.isFinite(explicitPlatformPrice) && explicitPlatformPrice > 0) {
    return {
      ...data,
      platform_price: explicitPlatformPrice,
      platformPrice: explicitPlatformPrice,
      price: data.price ?? explicitPlatformPrice,
    };
  }

  const config = await readConfig();
  const margin = Number(config.platform_commission ?? 15);
  const platformPrice = Math.round((supplierPrice + (supplierPrice * margin) / 100) * 100) / 100;
  return {
    ...data,
    supplier_price: supplierPrice,
    supplierPrice,
    platform_price: platformPrice,
    platformPrice,
    price: platformPrice,
    margin,
  };
}

function normalizeAd(ad = {}) {
  const now = new Date().toISOString();
  const id = String(ad.id || `ad-${Date.now()}`);
  const sourceType = ad.sourceType || "cms";
  let placement = ad.placement || "checkout_ads";
  if (placement === "featured_mega") placement = "mega";
  if (placement === "featured_scroll") placement = "scroll";

  return {
    ...ad,
    id,
    title: ad.title || ad.name || "Advertisement",
    name: ad.name || ad.title || "Advertisement",
    link: ad.link || ad.targetUrl || "",
    targetUrl: ad.targetUrl || ad.link || "",
    imageUrl: ad.imageUrl || ad.image_url || ad.image || ad.url || "",
    sourceType,
    placement,
    active: Object.prototype.hasOwnProperty.call(ad, "active") ? Boolean(ad.active) : true,
    text: ad.text || "",
    price: Number(ad.price || 0),
    createdAt: ad.createdAt || now,
    updatedAt: ad.updatedAt || now,
  };
}

async function readStoredAds() {
  const rows = await readJson(adStoreFile, []);
  return Array.isArray(rows) ? rows.map(normalizeAd).filter((ad) => ad.status !== "deleted") : [];
}

async function writeStoredAds(ads) {
  await writeJson(adStoreFile, ads.map(normalizeAd));
}

export async function listAds() {
  const stored = await readStoredAds();
  const storedIds = new Set(stored.map((ad) => String(ad.id)));
  return [
    ...stored,
    ...defaultAds.filter((ad) => !storedIds.has(String(ad.id))).map(normalizeAd),
  ];
}

export async function getAd(id) {
  const decodedId = decodeURIComponent(String(id || ""));
  return (await listAds()).find((ad) => String(ad.id) === decodedId) || null;
}

export async function upsertAd(data = {}, id = "") {
  const stored = await readStoredAds();
  const decodedId = id ? decodeURIComponent(String(id)) : "";
  const existing = decodedId
    ? (stored.find((ad) => String(ad.id) === decodedId) || defaultAds.find((ad) => String(ad.id) === decodedId))
    : null;
  const ad = normalizeAd({
    ...(existing || {}),
    ...data,
    id: decodedId || data.id || `ad-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  });

  await writeStoredAds([
    ad,
    ...stored.filter((item) => String(item.id) !== String(ad.id)),
  ]);
  return ad;
}

export async function deleteAd(id) {
  const decodedId = decodeURIComponent(String(id || ""));
  const stored = await readStoredAds();
  const next = stored.filter((ad) => String(ad.id) !== decodedId);
  if (next.length !== stored.length) {
    await writeStoredAds(next);
    return true;
  }
  return false;
}
