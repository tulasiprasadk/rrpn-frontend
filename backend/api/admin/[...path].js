import { setCors } from "../_lib/auth.js";
import {
  getPageOrder,
  listPageOrderCustomers,
  listPageOrders,
  updatePageOrderStatus,
} from "../_lib/pageOrders.js";

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

function dbWarning(error) {
  return {
    warning: error.message || "Database unavailable",
    databaseAvailable: false,
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
        ...dbWarning(error),
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
        ...dbWarning(error),
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
        ...dbWarning(error),
      });
    }
  }

  return res.status(404).json({ error: "Resource not found" });
}
