// d:\RRPN\frontend\src\api\subscriptionApi.js

import { buildDefaultSubscriptionProducts } from "../data/rationPlans";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Adjust as per your actual API base URL

function normalizePlan(plan) {
  const metadata = plan.metadata || plan.meta || {};
  const includedItems = Array.isArray(plan.includedItems) ? plan.includedItems : [];
  const items = includedItems.length
    ? includedItems.map((item, index) => ({
        key: item.key || `item-${index}`,
        title: item.itemName || item.name || item.title || "Item",
        quantity: Number(item.itemQuantity || item.quantity || 1),
        unitPrice: Number(item.unitPrice || item.price || 0),
        unit: item.unit || "",
        section: item.section || ""
      }))
    : Array.isArray(plan.items)
      ? plan.items
      : [];

  return {
    id: plan.id,
    title: plan.title || plan.name || plan.productName || "Subscription",
    name: plan.title || plan.name || plan.productName || "Subscription",
    price: Number(plan.monthlyPrice || plan.price || plan.amount || 0),
    monthlyPrice: Number(plan.monthlyPrice || plan.price || plan.amount || 0),
    yearlyPrice: Number(plan.yearlyPrice || 0),
    savings: plan.discountAmount || plan.savings || 0,
    totalWeight: plan.weightKg || plan.totalWeight || 0,
    description: plan.description || plan.summary || "",
    category: plan.category || plan.Category || null,
    metadata: items.length && !Array.isArray(metadata.items) ? { ...metadata, items } : metadata,
    items,
    unit: plan.unit || "",
    variety: plan.variety || "",
    isPopular: plan.isPopular || plan.popular || false
  };
}

function pickPlanRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.plans)) return data.plans;
  const monthly = Array.isArray(data?.monthly) ? data.monthly : [];
  const yearly = Array.isArray(data?.yearly) ? data.yearly : [];
  return monthly.length ? monthly : yearly;
}

function mergeFallbackCategories(rows) {
  const normalizedRows = rows.map(normalizePlan);
  const presentCategories = new Set(
    normalizedRows.map((item) => String(item.category?.name || item.category || "").trim().toLowerCase())
  );
  const fallbackRows = buildDefaultSubscriptionProducts().filter((item) => {
    const category = String(item.category || "").trim().toLowerCase();
    return !presentCategories.has(category);
  });

  return [...normalizedRows, ...fallbackRows];
}

/**
 * Fetches subscription plans from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of subscription plan objects.
 */
export const fetchSubscriptionPlans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions/plans`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return mergeFallbackCategories(pickPlanRows(data));
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    console.warn('Using fallback subscription plans due to API error.');
    return buildDefaultSubscriptionProducts();
  }
};
