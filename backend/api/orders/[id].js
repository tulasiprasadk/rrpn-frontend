import { json, setCors } from "../_lib/auth.js";
import { getPageOrder } from "../_lib/pageOrders.js";

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const order = await getPageOrder(req.query?.id);
    if (!order) return json(res, 404, { error: "Order not found" });
    return json(res, 200, { ok: true, order, ...order });
  } catch (error) {
    console.error("Read page order error:", error);
    return json(res, 500, { error: error.message || "Failed to load order" });
  }
}
