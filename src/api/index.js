import api from "./client";
import { API_BASE } from "../config/api";

export async function getProducts(query = "", categoryId = "", limit = 50000) {
  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (categoryId) params.append("categoryId", categoryId);
    if (limit) params.append("limit", String(limit));

    const url =
      params.toString().length > 0
        ? `${API_BASE}/products?${params.toString()}`
        : `${API_BASE}/products`;

    const res = await fetch(url);

    // Some deployments may return an HTML page (deployment protection or misrouting).
    // Detect non-JSON responses and fall back to the local static `products.json`.
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("application/json")) {
      console.warn("API getProducts: non-JSON response, falling back to local products.json", url, contentType);
      try {
        const fallback = await fetch("/products.json");
        if (!fallback.ok) throw new Error("Failed to load local products.json");
        const json = await fallback.json();
        return json && json.value ? json.value : json || [];
      } catch (fbErr) {
        console.error("Failed to load fallback products.json:", fbErr);
        throw new Error("Failed to load products");
      }
    }

    const data = await res.json();
    return data && data.value ? data.value : data;
  } catch (err) {
    console.error("API getProducts error:", err);
    return [];
  }
}

export async function getProduct(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);

    if (!res.ok) throw new Error("Failed to load product");
    const data = await res.json();
    return data && data.value ? data.value : data;
  } catch (err) {
    console.error("API getProduct error:", err);
    return null;
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error("Failed to load categories");
    const data = await res.json();
    return data && data.value ? data.value : data || [];
  } catch (err) {
    console.error("API getCategories error:", err);
    return [];
  }
}

export default api;
