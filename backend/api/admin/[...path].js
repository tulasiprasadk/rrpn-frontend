import { setCors } from "../_lib/auth.js";
import {
  getPageOrder,
  listPageOrderCustomers,
  listPageOrders,
  updatePageOrderStatus,
} from "../_lib/pageOrders.js";
import {
  assignProductSupplier,
  deleteAd,
  deleteSupplier,
  getAd,
  getSupplier,
  getSupplierStats,
  listAds,
  listProductSuppliers,
  listSupplierProducts,
  listSuppliers,
  readConfig,
  removeProductSupplier,
  upsertAd,
  updateConfigValue,
  updateSupplier,
  upsertSupplier,
} from "../_lib/adminStores.js";

function getRoute(req) {
  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  return pathname.replace(/^\/api\/admin\/?/, "").replace(/^\/admin\/?/, "");
}

function readBody(body) {
  if (!body || typeof body === "object") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function softWarning(error) {
  return {
    warning: error.message || "Store unavailable",
    storeAvailable: false,
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const route = getRoute(req);

  if (route === "notifications") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    return res.status(200).json({ notifications: [] });
  }

  if (route === "notifications/mark-read") {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      res.setHeader("Allow", "POST, PUT, PATCH, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    return res.status(200).json({ success: true });
  }

  if (route === "config") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    return res.status(200).json(await readConfig());
  }

  if (route.startsWith("config/")) {
    const [, key] = route.split("/");
    if (!key) return res.status(400).json({ error: "Config key is required" });
    if (!["PUT", "PATCH", "POST"].includes(req.method)) {
      res.setHeader("Allow", "PUT, PATCH, POST, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const result = await updateConfigValue(key, readBody(req.body));
    return res.status(200).json({ success: true, ...result });
  }

  if (route === "ads") {
    if (req.method === "GET") {
      const ads = await listAds();
      return res.status(200).json({ data: ads, ads });
    }

    if (req.method === "POST") {
      const ad = await upsertAd(readBody(req.body));
      return res.status(201).json({ success: true, data: ad, ad });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (route.startsWith("ads/")) {
    const [, rawAdId] = route.split("/");
    if (!rawAdId) return res.status(400).json({ error: "Advertisement ID is required" });

    if (req.method === "GET") {
      const ad = await getAd(rawAdId);
      if (!ad) return res.status(404).json({ error: "Advertisement not found" });
      return res.status(200).json({ data: ad, ad, ...ad });
    }

    if (["PUT", "PATCH", "POST"].includes(req.method)) {
      const ad = await upsertAd(readBody(req.body), rawAdId);
      return res.status(200).json({ success: true, data: ad, ad });
    }

    if (req.method === "DELETE") {
      const deleted = await deleteAd(rawAdId);
      if (!deleted) return res.status(404).json({ error: "Advertisement not found" });
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET, PUT, PATCH, POST, DELETE, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (route === "suppliers" || route === "suppliers/list") {
    if (req.method === "GET") {
      const suppliers = await listSuppliers();
      return res.status(200).json({ data: suppliers, suppliers });
    }

    if (req.method === "POST") {
      const supplier = await upsertSupplier(readBody(req.body));
      return res.status(201).json({ data: supplier, supplier, ...supplier });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (route.startsWith("suppliers/stats/")) {
    const [, , supplierId] = route.split("/");
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    return res.status(200).json(await getSupplierStats(supplierId));
  }

  if (route.startsWith("suppliers/")) {
    const [, supplierId, action] = route.split("/");

    if (req.method === "GET" && action === "products") {
      const products = await listSupplierProducts(supplierId);
      return res.status(200).json({ data: products, products });
    }

    if (req.method === "GET" && !action) {
      const supplier = await getSupplier(supplierId);
      if (!supplier) return res.status(404).json({ error: "Supplier not found" });
      const products = await listSupplierProducts(supplierId);
      return res.status(200).json({
        data: { ...supplier, productsCount: products.length },
        supplier: { ...supplier, productsCount: products.length },
      });
    }

    if (["PUT", "PATCH"].includes(req.method) && !action) {
      const supplier = await updateSupplier(supplierId, readBody(req.body));
      if (!supplier) return res.status(404).json({ error: "Supplier not found" });
      return res.status(200).json({ success: true, data: supplier, supplier });
    }

    if (req.method === "POST" && action === "approve") {
      const supplier = await updateSupplier(supplierId, { status: "approved", rejectionReason: "" });
      if (!supplier) return res.status(404).json({ error: "Supplier not found" });
      return res.status(200).json({ success: true, data: supplier, supplier });
    }

    if (req.method === "POST" && action === "reject") {
      const body = readBody(req.body);
      const supplier = await updateSupplier(supplierId, {
        status: "rejected",
        rejectionReason: body.reason || body.rejectionReason || "",
      });
      if (!supplier) return res.status(404).json({ error: "Supplier not found" });
      return res.status(200).json({ success: true, data: supplier, supplier });
    }

    if (req.method === "DELETE" && !action) {
      const deleted = await deleteSupplier(supplierId);
      if (!deleted) return res.status(404).json({ error: "Supplier not found" });
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET, PUT, PATCH, POST, DELETE, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (route.startsWith("products/")) {
    const [, productId, resource, supplierId] = route.split("/");

    if (resource === "suppliers" && req.method === "GET" && !supplierId) {
      const suppliers = await listProductSuppliers(productId);
      return res.status(200).json(suppliers);
    }

    if (resource === "suppliers" && req.method === "POST" && !supplierId) {
      try {
        const supplier = await assignProductSupplier(productId, readBody(req.body));
        return res.status(200).json({ success: true, data: supplier, supplier, ...supplier });
      } catch (error) {
        return res.status(400).json({ error: error.message || "Failed to assign supplier" });
      }
    }

    if (resource === "suppliers" && req.method === "DELETE" && supplierId) {
      const deleted = await removeProductSupplier(productId, supplierId);
      if (!deleted) return res.status(404).json({ error: "Product supplier not found" });
      return res.status(200).json({ success: true });
    }
  }

  if (route === "users") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const users = await listPageOrderCustomers();
      return res.status(200).json({ data: users, users });
    } catch (error) {
      console.error("Admin users error:", error);
      return res.status(200).json({
        data: [],
        users: [],
        ...softWarning(error),
      });
    }
  }

  if (route === "orders") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const orders = await listPageOrders({
        status: req.query?.status || "",
        limit: req.query?.limit || 200,
      });
      return res.status(200).json({ data: orders, orders });
    } catch (error) {
      console.error("Admin orders error:", error);
      return res.status(200).json({
        data: [],
        orders: [],
        ...softWarning(error),
      });
    }
  }

  if (route.startsWith("orders/")) {
    const [, orderId, action] = route.split("/");

    try {
      if (req.method === "GET" && orderId && !action) {
        const order = await getPageOrder(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json({ data: order, order, ...order });
      }

      if (["PUT", "PATCH", "POST"].includes(req.method) && orderId) {
        const body = readBody(req.body);
        const nextStatus =
          action === "approve" ? "approved" :
          action === "reject" ? "rejected" :
          body.status || "created";
        const nextPaymentStatus =
          action === "approve" ? "approved" :
          action === "reject" ? "rejected" :
          body.paymentStatus || null;

        const order = await updatePageOrderStatus(orderId, nextStatus, nextPaymentStatus);
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json({ success: true, data: order, order });
      }

      res.setHeader("Allow", "GET, PUT, PATCH, POST, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
      console.error("Admin order detail error:", error);
      return res.status(200).json({
        data: null,
        order: null,
        ...softWarning(error),
      });
    }
  }

  return res.status(404).json({ error: "Resource not found" });
}
