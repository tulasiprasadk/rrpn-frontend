import { json, setCors } from "./auth.js";
import { createPageOrder, getPageOrder, submitPageOrderPayment } from "./pageOrders.js";
import { readJsonBody } from "./subscription.js";

function getSegments(req) {
  const routePath = req.query?.path;
  if (Array.isArray(routePath)) return routePath.map(String);
  if (routePath) return String(routePath).split("/").filter(Boolean);

  const pathname = String(req.url || "").split("?")[0];
  const [, orderPath = ""] = pathname.split("/api/orders/");
  return orderPath.split("/").filter(Boolean);
}

function getTextBody(req) {
  if (typeof req.body === "string") return Promise.resolve(req.body);
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body.toString("utf8"));

  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function getMultipartField(body, name) {
  const pattern = new RegExp(`name="${name}"\\r?\\n\\r?\\n([^\\r\\n]+)`, "i");
  return body.match(pattern)?.[1]?.trim() || "";
}

async function createOrder(req, res, isGuest) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const order = await createPageOrder(await readJsonBody(req), isGuest);
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

async function readOrder(req, res, orderId) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const order = await getPageOrder(orderId);
    if (!order) return json(res, 404, { error: "Order not found" });
    return json(res, 200, { ok: true, order, ...order });
  } catch (error) {
    console.error("Read page order error:", error);
    return json(res, 500, { error: error.message || "Failed to load order" });
  }
}

async function submitPayment(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const body = await getTextBody(req);
    const orderId = getMultipartField(body, "orderId");
    const unr = getMultipartField(body, "unr");
    if (!orderId) return json(res, 400, { error: "Order ID is required" });

    const order = await submitPageOrderPayment(orderId, {
      unr,
      proofReceived: body.includes('name="paymentScreenshot"'),
      submittedAt: new Date().toISOString(),
    });
    if (!order) return json(res, 404, { error: "Order not found" });
    return json(res, 200, { ok: true, order });
  } catch (error) {
    console.error("Submit page order payment error:", error);
    return json(res, 500, { error: error.message || "Failed to submit payment" });
  }
}

export default async function orderHandler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const [route] = getSegments(req);
  if (route === "create") return createOrder(req, res, false);
  if (route === "create-guest") return createOrder(req, res, true);
  if (route === "submit-payment") return submitPayment(req, res);
  if (route) return readOrder(req, res, route);

  return json(res, 404, { error: "Order route not found" });
}
