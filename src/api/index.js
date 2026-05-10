import api from "./client";

export async function getProducts(query = "", categoryId = "", limit = 50000) {
  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (categoryId) params.append("categoryId", categoryId);
    if (limit) params.append("limit", String(limit));

    const { data } = await api.get("/products", { params });
    return data && data.value ? data.value : data;
  } catch (err) {
    console.error("API getProducts error:", err);
    return [];
  }
}

export async function getProduct(id) {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data && data.value ? data.value : data;
  } catch (err) {
    console.error("API getProduct error:", err);
    return null;
  }
}

export async function getCategories() {
  try {
    const { data } = await api.get("/categories");
    return data && data.value ? data.value : data || [];
  } catch (err) {
    console.error("API getCategories error:", err);
    return [];
  }
}

export async function createOrder(orderData, isGuest = false) {
  try {
    console.log("[Frontend API] Sending order creation request:", orderData);
    const endpoint = isGuest ? "/orders/create-guest" : "/orders/create";

    const { data } = await api.post(endpoint, orderData, {
      timeout: 30000, // Increased timeout for checkout
    });
    return data;
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
    const { data } = await api.get(`/orders/${orderId}`, {
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error(`[Frontend API] Error fetching order ${orderId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order.');
  }
}

export default api;
