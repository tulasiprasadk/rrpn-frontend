// src/api/index.js

import { API_BASE } from "../config/api";

// Get all products or search by keyword
export async function getProducts(query = "", categoryId = "") {
  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (categoryId) params.append("categoryId", categoryId);

    const url =
      params.toString().length > 0
        ? `${API_BASE}/products?${params.toString()}`
        : `${API_BASE}/products`;

    const res = await fetch(url, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    // Backend may return a wrapper { value: [...], Count }
    return data && data.value ? data.value : data;
  } catch (err) {
    console.error("API getProducts error:", err);
    return [];
  }
}

// Get a single product by ID
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

// Get list of categories
export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load categories');
    const data = await res.json();
    // Backend may return a wrapper { value: [...], Count }
    return data && data.value ? data.value : data || [];
  } catch (err) {
    console.error('API getCategories error:', err);
    return [];
  }
}



