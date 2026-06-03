import { getProducts } from "../_lib/catalog.js";
import { setCors } from "../_lib/auth.js";
import { createStoredProduct } from "../_lib/productStore.js";

export default async function handler(req, res) {
  setCors(req, res);
  res.setHeader("X-API-Source", "NEW_HANDLER_V2");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    if (req.method === "POST") {
      const product = await createStoredProduct(req.body || {});
      return res.status(201).json(product);
    }

    const products = await getProducts(req.query || {});
    return res.status(200).json(products);
  } catch (err) {
    console.error("Products error:", err);
    return res.status(500).json({ error: err.message || "Failed to load products" });
  }
}
