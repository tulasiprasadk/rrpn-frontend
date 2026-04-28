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

    const res = await fetch(url, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    return data && data.value ? data.value : data;
  } catch (err) {
    console.error("API getProducts error:", err);
    return [];
  }
}

export async function getProduct(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      credentials: "include",
    });

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
    const res = await fetch(`${API_BASE}/categories`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load categories");
    const data = await res.json();
    return data && data.value ? data.value : data || [];
  } catch (err) {
    console.error("API getCategories error:", err);
    return [];
  }
}

export default api;
