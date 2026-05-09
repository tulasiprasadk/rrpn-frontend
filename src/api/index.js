import api from "./client";
import axios from 'axios';
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

export async function createOrder(orderData, isGuest = false) {
  try {
    console.log("[Frontend API] Sending order creation request:", orderData);
    const endpoint = isGuest ? `${API_BASE}/orders/create-guest` : `${API_BASE}/orders/create`;

    const res = await axios.post(endpoint, orderData, {
      withCredentials: true,
      timeout: 30000, // Increased timeout for checkout
    });

    if (res.status >= 200 && res.status < 300) {
      console.log("[Frontend API] Order created successfully:", res.data);
      return res.data;
    } else {
      throw new Error(res.data.message || `Failed to create order: ${res.status}`);
    }
  } catch (error) {
    console.error("[Frontend API] Order creation error:", error);
    let errorMessage = "Failed to create order: Request timed out";
    if (error.response) {
      errorMessage = error.response.data.message || error.message;
    } else if (error.request) {
      errorMessage = "Failed to create order: No response from server.";
    } else {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}

export async function getOrder(orderId) {
  try {
    console.log(`[Frontend API] Fetching order ${orderId}`);
    const res = await axios.get(`${API_BASE}/orders/${orderId}`, {
      withCredentials: true,
      timeout: 10000,
    });

    if (res.status >= 200 && res.status < 300) {
      return res.data;
    } else {
      throw new Error(res.data.message || `Failed to fetch order: ${res.status}`);
    }
  } catch (error) {
    console.error(`[Frontend API] Error fetching order ${orderId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order.');
  }
}

export default api;
