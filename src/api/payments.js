import api from "./client";
import { sanitizeBase64DataUrl } from "../config/api";

export async function fetchOrder(orderId) {
  try {
    const { data } = await api.get(`/orders/${orderId}`);
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

  const { data } = await api.put(`/orders/${orderId}`, payload);

  return data || null;
}

export async function fetchOrdersForBuyer(buyerId) {
  if (!buyerId) {
    return [];
  }

  try {
    const { data } = await api.get("/orders", {
      params: { buyerId }
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchOrdersForBuyer error:", err);
    return [];
  }
}
