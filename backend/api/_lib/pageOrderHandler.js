import { createPageOrder } from "./pageOrders.js";
import { json, setCors } from "./auth.js";
import { readJsonBody } from "./subscription.js";

export async function handleCreatePageOrder(req, res, isGuest) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const data = await readJsonBody(req);
    const order = await createPageOrder(data, isGuest);
    return json(res, 201, {
      ok: true,
      orderId: order.orderId,
      order,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error("Create page order error:", error);
    return json(res, error.message?.includes("required") ? 400 : 500, {
      error: error.message || "Failed to create order",
    });
  }
}
