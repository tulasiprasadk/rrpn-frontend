import { json, setCors } from "../_lib/auth.js";
import { submitPageOrderPayment } from "../_lib/pageOrders.js";

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

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const body = await getTextBody(req);
    const contentType = String(req.headers["content-type"] || "");
    const isMultipart = contentType.includes("multipart/form-data");
    const orderId = isMultipart ? getMultipartField(body, "orderId") : "";
    const unr = isMultipart ? getMultipartField(body, "unr") : "";
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
