import api from "./client";
import { calculateSubscriptionPreview, GROCERY_PLANS } from "../components/subscription/subscriptionConfig";

/**
 * Fetches subscription plans from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of subscription plan objects.
 */
function buildRationPlanProducts() {
  return GROCERY_PLANS.map((plan) => {
    const preview = calculateSubscriptionPreview({
      category: "ration",
      duration: "monthly",
      items: plan.items
    });

    return {
      id: `ration-${plan.value}`,
      title: `${plan.label} Ration`,
      name: `${plan.label} Ration`,
      description: `Monthly ${plan.label.toLowerCase()} household essentials basket.`,
      price: preview.durationBasePrice,
      basePrice: preview.durationBasePrice,
      unit: "basket",
      category: "Ration",
      Category: { id: "ration", name: "Ration" },
      metadata: {
        badge: plan.badge,
        itemCount: plan.items.length,
        highlights: plan.items.slice(0, 3).map((item) => item.title),
        items: plan.items.map((item) => ({
          ...item,
          section: "Household essentials"
        }))
      }
    };
  });
}

function getPlanRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.monthly) && data.monthly.length) return data.monthly;
  if (Array.isArray(data?.plans)) return data.plans;
  if (Array.isArray(data?.value)) return data.value;
  return [];
}

function withRationPlans(rows) {
  const products = Array.isArray(rows) ? rows.filter(Boolean) : [];
  const hasRationPlan = products.some((product) =>
    String(product?.Category?.name || product?.category || "")
      .toLowerCase()
      .includes("ration")
  );

  return hasRationPlan ? products : [...buildRationPlanProducts(), ...products];
}

export const fetchSubscriptionPlans = async () => {
  try {
    const { data } = await api.get("/subscriptions/plans");
    return withRationPlans(getPlanRows(data));
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    console.warn("Using local ration plans due to subscription API error.");
    return buildRationPlanProducts();
  }
};
