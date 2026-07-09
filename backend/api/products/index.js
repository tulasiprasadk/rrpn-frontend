import { getProductById, getProducts } from "../_lib/catalog.js";
import { setCors } from "../_lib/auth.js";
import { createStoredProduct, deleteStoredProduct, updateStoredProduct } from "../_lib/productStore.js";

function readBody(body) {
  if (!body || typeof body === "object") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  setCors(req, res);
  res.setHeader("X-API-Source", "NEW_HANDLER_V2");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const id = req.query?.id;

    if (id && (req.method === "PUT" || req.method === "PATCH")) {
      const product = await updateStoredProduct(id, readBody(req.body));
      if (!product) return res.status(404).json({ error: "Product not found or not editable" });
      return res.status(200).json(product);
    }

    if (id && req.method === "DELETE") {
      const existingProduct = await getProductById(id);
      if (!existingProduct) return res.status(404).json({ error: "Product not found or not editable" });

      const deleted = await deleteStoredProduct(id);
      if (!deleted) return res.status(404).json({ error: "Product not found or not editable" });
      return res.status(200).json({ success: true });
    }

    if (id && req.method === "GET") {
      const product = await getProductById(id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json(product);
    }

    if (req.method === "POST") {
      const product = await createStoredProduct(readBody(req.body));
      return res.status(201).json(product);
    }

    const products = await getProducts(req.query || {});
    return res.status(200).json(products);
  } catch (err) {
    console.error("Products error:", err);
    return res.status(500).json({ error: err.message || "Failed to load products" });
  }
}
