import { API_BASE, sanitizeBase64DataUrl } from "../config/api";

export async function fetchOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || data?.error || "Failed to load order");
    }
    return data || null;
  } catch (err) {
    console.error("fetchOrder error:", err);
    return null;
  }
}

export async function updateOrder(orderId, patch) {
  const payload = {
    ...patch,
    paymentEvidence: sanitizeBase64DataUrl(patch?.paymentEvidence),
  };

  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to update order");
  }

  return data || null;
}

export async function fetchOrdersForBuyer(buyerId) {
  if (!buyerId) {
    return [];
  }

  try {
    const url = new URL(`${API_BASE}/orders`);
    url.searchParams.set("buyerId", buyerId);

    const res = await fetch(url.toString(), {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || data?.error || "Failed to load orders");
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchOrdersForBuyer error:", err);
    return [];
  }
}
