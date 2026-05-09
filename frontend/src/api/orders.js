import { API_BASE } from "../config/api";

export const fetchOrder = async (orderId) => {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (err) {
    console.error("Error fetching order:", err);
    return null;
  }
};



