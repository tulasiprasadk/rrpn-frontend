import { setCors } from "../_lib/auth.js";

function getRoute(req) {
  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  return pathname.replace(/^\/api\/cms\/?/, "").replace(/^\/cms\/?/, "");
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const route = getRoute(req);
  if (route === "checkout-offers" || route === "checkout-ads") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    return res.status(200).json([]);
  }

  return res.status(404).json({ error: "Resource not found" });
}
