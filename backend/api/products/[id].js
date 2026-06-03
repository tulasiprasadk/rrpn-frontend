import { getProductById } from "../_lib/catalog.js";
import { setCors } from "../_lib/auth.js";
import { deleteStoredProduct, updateStoredProduct } from "../_lib/productStore.js";

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
  if (req.method === "OPTIONS") return res.status(204).end();

  if (!["GET", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, PUT, PATCH, DELETE, OPTIONS");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const product = await updateStoredProduct(req.query?.id, readBody(req.body));
    if (!product) return res.status(404).json({ error: "Product not found or not editable" });
    return res.status(200).json(product);
  }

  if (req.method === "DELETE") {
    const deleted = await deleteStoredProduct(req.query?.id);
    if (!deleted) return res.status(404).json({ error: "Product not found or not editable" });
    return res.status(200).json({ success: true });
  }

  const product = await getProductById(req.query?.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.status(200).json(product);
}
