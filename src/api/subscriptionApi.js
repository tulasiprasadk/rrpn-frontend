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
    // Map backend response to the desired frontend format
    return data.map(plan => ({
      id: plan.id,
      name: plan.title || plan.name, // Assuming 'title' or 'name' from backend
      price: plan.monthlyPrice || plan.price,
      savings: plan.discountAmount || plan.savings || 0, // Assuming 'discountAmount' or 'savings'
      totalWeight: plan.weightKg || plan.totalWeight || 0, // Assuming 'weightKg' or 'totalWeight'
      items: plan.includedItems ? plan.includedItems.map(item => ({ // Assuming 'includedItems'
        name: item.itemName || item.name,
        quantity: item.itemQuantity || item.quantity
      })) : [],
      isPopular: plan.isPopular || false, // Assuming backend provides this
    }));
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    // Fallback: return a set of sensible default plans so the UI remains functional
    const fallbackPlans = [
      { id: 'basic', name: 'Basic Ration', price: 1499, savings: 200, totalWeight: 15, isPopular: false, items: [{name: 'Rice', quantity: '5kg'}, {name: 'Oil', quantity: '1L'}] },
      { id: 'standard', name: 'Standard Family', price: 2499, savings: 450, totalWeight: 26, isPopular: true, items: [{name: 'Rice', quantity: '10kg'}, {name: 'Atta', quantity: '5kg'}, {name: 'Oil', quantity: '2L'}] },
      { id: 'premium', name: 'Premium Mega', price: 4299, savings: 800, totalWeight: 45, isPopular: false, items: [{name: 'Rice', quantity: '20kg'}, {name: 'Atta', quantity: '10kg'}, {name: 'Oil', quantity: '5L'}] },
    ];

    console.warn('Using fallback subscription plans due to API error.');
    return fallbackPlans;
  }
};