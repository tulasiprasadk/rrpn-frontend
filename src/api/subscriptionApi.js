// d:\RRPN\frontend\src\api\subscriptionApi.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Adjust as per your actual API base URL

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
    // Map backend response to the frontend product shape expected by the UI
    return (Array.isArray(data) ? data : []).map((plan) => ({
      id: plan.id,
      title: plan.title || plan.name || plan.productName || "Subscription",
      price: Number(plan.monthlyPrice || plan.price || plan.amount || 0),
      description: plan.description || plan.summary || "",
      category: plan.category || plan.category?.name || "ration",
      metadata: plan.metadata || plan.meta || {},
      items: Array.isArray(plan.includedItems)
        ? plan.includedItems.map((it, idx) => ({
            key: it.key || `item-${idx}`,
            title: it.itemName || it.name || it.title || "Item",
            quantity: Number(it.itemQuantity || it.quantity || 1),
            unitPrice: Number(it.unitPrice || it.price || 0),
            unit: it.unit || "",
            section: it.section || ""
          }))
        : Array.isArray(plan.items)
        ? plan.items
        : [],
      isPopular: plan.isPopular || plan.popular || false
    }));
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    // Fallback: return a set of sensible default plans so the UI remains functional
    // Provide richer fallback objects that the subscriptions UI expects (title, category, metadata)
    const fallbackPlans = [
      {
        id: 'basic',
        title: 'Basic Ration',
        price: 1499,
        isPopular: false,
        category: 'ration',
        metadata: {
          badge: 'Monthly ration',
          itemCount: 6,
          // include items inside metadata so `SubscriptionPopup` can read them as a ration
          items: [
            { key: 'rice-5', title: 'Rice', quantity: 5, unitPrice: 0, unit: 'kg', section: 'Grains' },
            { key: 'oil-1', title: 'Oil', quantity: 1, unitPrice: 0, unit: 'L', section: 'Oils' }
          ]
        }
      },
      {
        id: 'standard',
        title: 'Standard Family',
        price: 2499,
        isPopular: true,
        category: 'ration',
        metadata: {
          badge: 'Family plan',
          itemCount: 10,
          items: [
            { key: 'rice-10', title: 'Rice', quantity: 10, unitPrice: 0, unit: 'kg' },
            { key: 'atta-5', title: 'Atta', quantity: 5, unitPrice: 0, unit: 'kg' },
            { key: 'oil-2', title: 'Oil', quantity: 2, unitPrice: 0, unit: 'L' }
          ]
        }
      },
      {
        id: 'premium',
        title: 'Premium Mega',
        price: 4299,
        isPopular: false,
        category: 'ration',
        metadata: {
          badge: 'Premium basket',
          itemCount: 18,
          items: [
            { key: 'rice-20', title: 'Rice', quantity: 20, unitPrice: 0, unit: 'kg' },
            { key: 'atta-10', title: 'Atta', quantity: 10, unitPrice: 0, unit: 'kg' },
            { key: 'oil-5', title: 'Oil', quantity: 5, unitPrice: 0, unit: 'L' }
          ]
        }
      }
    ];

    console.warn('Using fallback subscription plans due to API error.');
    return fallbackPlans;
  }
};