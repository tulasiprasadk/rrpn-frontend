import api from "./client";

export const fetchOrder = async (orderId) => {
  try {
    const { data } = await api.get(`/orders/${orderId}`);

    return data;
  } catch (err) {
    console.error("Error fetching order:", err);
    return null;
  }
};
