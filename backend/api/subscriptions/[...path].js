import { getProducts } from "../_lib/catalog.js";
import { json, setCors } from "../_lib/auth.js";

function readBody(body) {
  if (!body || typeof body === "object") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function getPath(req) {
  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  const route = pathname
    .replace(/^\/api\/subscriptions\/?/, "")
    .replace(/^\/subscriptions\/?/, "");
  return route.split("/").filter(Boolean);
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const [route] = getPath(req);

  if (route === "plans") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return json(res, 405, { error: "Method Not Allowed" });
    }

    const plans = await getProducts({ limit: 50000 });
    const monthly = plans.filter((product) =>
      ["flowers", "pet services", "groceries", "ration"].some((name) =>
        String(product.Category?.name || product.category || "").toLowerCase().includes(name)
      )
    );

    return json(res, 200, { plans, monthly });
  }

  if (route === "create") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return json(res, 405, { error: "Method Not Allowed" });
    }

    console.log("Subscription Data Received:", readBody(req.body));
    return json(res, 201, { success: true, message: "Subscription created" });
  }

  return json(res, 404, { error: "Resource not found" });
}
