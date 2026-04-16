export const SUBSCRIPTION_DURATIONS = [
  { value: "monthly", label: "Monthly", months: 1, discountPercent: 5 },
  { value: "quarterly", label: "3 Months", months: 3, discountPercent: 7, badge: "Best Balance" },
  { value: "half_yearly", label: "6 Months", months: 6, discountPercent: 9 },
  { value: "yearly", label: "12 Months", months: 12, discountPercent: 12, badge: "Best Value" }
];

export const SUBSCRIPTION_FREQUENCIES = [
  { value: "monthly_4", label: "4 times/month", occurrencesPerMonth: 4 },
  { value: "monthly_15", label: "15 times/month", occurrencesPerMonth: 15 },
  { value: "monthly_30", label: "30 times/month", occurrencesPerMonth: 30 },
  { value: "twice_weekly", label: "2 times/week", occurrencesPerMonth: 8, multiplier: 2 / 7 },
  { value: "thrice_weekly", label: "3 times/week", occurrencesPerMonth: 12, multiplier: 3 / 7 },
  { value: "daily", label: "Daily", occurrencesPerMonth: 30, multiplier: 1 }
];

export const GROCERY_PLANS = [
  {
    value: "basic",
    label: "Basic",
    badge: "Daily Basics",
    items: [
      { key: "rice", title: "Rice", quantity: 5, unit: "kg", unitPrice: 58 },
      { key: "atta", title: "Atta", quantity: 3, unit: "kg", unitPrice: 54 },
      { key: "oil", title: "Oil", quantity: 1, unit: "ltr", unitPrice: 170 },
      { key: "pulses", title: "Pulses", quantity: 2, unit: "kg", unitPrice: 120 },
      { key: "sugar", title: "Sugar", quantity: 2, unit: "kg", unitPrice: 48 },
      { key: "salt", title: "Salt", quantity: 1, unit: "kg", unitPrice: 24 },
      { key: "turmeric", title: "Turmeric Powder", quantity: 1, unit: "pack", unitPrice: 35 },
      { key: "chilli", title: "Chilly Powder", quantity: 1, unit: "pack", unitPrice: 55 },
      { key: "coriander", title: "Coriander/Dhaniya Powder", quantity: 1, unit: "pack", unitPrice: 50.4 },
      { key: "tea", title: "Tea Powder", quantity: 1, unit: "pack", unitPrice: 232.5 },
      { key: "onion", title: "Onion", quantity: 1, unit: "kg", unitPrice: 60.27 },
      { key: "potato", title: "Potato", quantity: 1, unit: "kg", unitPrice: 19.76 },
      { key: "soap", title: "Toilet Soap", quantity: 3, unit: "bars", unitPrice: 40 },
      { key: "toothpaste", title: "Tooth Paste", quantity: 1, unit: "pack", unitPrice: 97 },
      { key: "detergent", title: "Detergent Powder", quantity: 1, unit: "kg", unitPrice: 90 }
    ]
  },
  {
    value: "standard",
    label: "Standard",
    badge: "Balanced Home",
    items: [
      { key: "rice", title: "Rice", quantity: 10, unit: "kg", unitPrice: 58 },
      { key: "atta", title: "Atta", quantity: 5, unit: "kg", unitPrice: 54 },
      { key: "oil", title: "Oil", quantity: 2, unit: "ltr", unitPrice: 170 },
      { key: "pulses", title: "Pulses", quantity: 3, unit: "kg", unitPrice: 120 },
      { key: "sugar", title: "Sugar", quantity: 3, unit: "kg", unitPrice: 48 },
      { key: "salt", title: "Salt", quantity: 2, unit: "kg", unitPrice: 24 },
      { key: "turmeric", title: "Turmeric Powder", quantity: 2, unit: "pack", unitPrice: 35 },
      { key: "chilli", title: "Chilly Powder", quantity: 2, unit: "pack", unitPrice: 55 },
      { key: "coriander", title: "Coriander/Dhaniya Powder", quantity: 1, unit: "pack", unitPrice: 50.4 },
      { key: "tea", title: "Tea Powder", quantity: 1, unit: "pack", unitPrice: 232.5 },
      { key: "coffee", title: "Coffee Powder", quantity: 1, unit: "pack", unitPrice: 210 },
      { key: "onion", title: "Onion", quantity: 2, unit: "kg", unitPrice: 60.27 },
      { key: "potato", title: "Potato", quantity: 2, unit: "kg", unitPrice: 19.76 },
      { key: "garlic", title: "Garlic", quantity: 1, unit: "250 g pack", unitPrice: 41.5 },
      { key: "dry-coconut", title: "Dry Coconut", quantity: 1, unit: "200 g pack", unitPrice: 118.75 },
      { key: "soap", title: "Toilet Soap", quantity: 4, unit: "bars", unitPrice: 40 },
      { key: "toothpaste", title: "Tooth Paste", quantity: 2, unit: "pack", unitPrice: 97 },
      { key: "detergent", title: "Detergent Powder", quantity: 2, unit: "kg", unitPrice: 90 }
    ]
  },
  {
    value: "advanced",
    label: "Advanced",
    badge: "Most Popular",
    items: [
      { key: "rice", title: "Rice", quantity: 15, unit: "kg", unitPrice: 58 },
      { key: "atta", title: "Atta", quantity: 7, unit: "kg", unitPrice: 54 },
      { key: "oil", title: "Oil", quantity: 3, unit: "ltr", unitPrice: 170 },
      { key: "pulses", title: "Pulses", quantity: 4, unit: "kg", unitPrice: 120 },
      { key: "sugar", title: "Sugar", quantity: 4, unit: "kg", unitPrice: 48 },
      { key: "salt", title: "Salt", quantity: 2, unit: "kg", unitPrice: 24 },
      { key: "turmeric", title: "Turmeric Powder", quantity: 2, unit: "pack", unitPrice: 35 },
      { key: "chilli", title: "Chilly Powder", quantity: 2, unit: "pack", unitPrice: 55 },
      { key: "coriander", title: "Coriander/Dhaniya Powder", quantity: 2, unit: "pack", unitPrice: 50.4 },
      { key: "tea", title: "Tea Powder", quantity: 2, unit: "pack", unitPrice: 232.5 },
      { key: "coffee", title: "Coffee Powder", quantity: 1, unit: "pack", unitPrice: 210 },
      { key: "onion", title: "Onion", quantity: 3, unit: "kg", unitPrice: 60.27 },
      { key: "potato", title: "Potato", quantity: 3, unit: "kg", unitPrice: 19.76 },
      { key: "garlic", title: "Garlic", quantity: 2, unit: "250 g pack", unitPrice: 41.5 },
      { key: "dry-coconut", title: "Dry Coconut", quantity: 2, unit: "200 g pack", unitPrice: 118.75 },
      { key: "pickle", title: "Mixed Pickle", quantity: 1, unit: "400 g jar", unitPrice: 110.5 },
      { key: "soap", title: "Toilet Soap", quantity: 6, unit: "bars", unitPrice: 40 },
      { key: "toothpaste", title: "Tooth Paste", quantity: 2, unit: "pack", unitPrice: 97 },
      { key: "washing", title: "Washing Soap", quantity: 4, unit: "bars", unitPrice: 22 },
      { key: "detergent", title: "Detergent Powder", quantity: 2, unit: "kg", unitPrice: 90 },
      { key: "dettol", title: "Dettol", quantity: 1, unit: "250 ml", unitPrice: 140.54 }
    ]
  },
  {
    value: "premium",
    label: "Premium",
    badge: "All Home Needs",
    items: [
      { key: "rice", title: "Rice", quantity: 20, unit: "kg", unitPrice: 58 },
      { key: "atta", title: "Atta", quantity: 10, unit: "kg", unitPrice: 54 },
      { key: "oil", title: "Oil", quantity: 4, unit: "ltr", unitPrice: 170 },
      { key: "pulses", title: "Pulses", quantity: 6, unit: "kg", unitPrice: 120 },
      { key: "sugar", title: "Sugar", quantity: 5, unit: "kg", unitPrice: 48 },
      { key: "salt", title: "Salt", quantity: 3, unit: "kg", unitPrice: 24 },
      { key: "turmeric", title: "Turmeric Powder", quantity: 3, unit: "pack", unitPrice: 35 },
      { key: "chilli", title: "Chilly Powder", quantity: 3, unit: "pack", unitPrice: 55 },
      { key: "coriander", title: "Coriander/Dhaniya Powder", quantity: 2, unit: "pack", unitPrice: 50.4 },
      { key: "tea", title: "Tea Powder", quantity: 2, unit: "pack", unitPrice: 232.5 },
      { key: "coffee", title: "Coffee Powder", quantity: 2, unit: "pack", unitPrice: 210 },
      { key: "onion", title: "Onion", quantity: 4, unit: "kg", unitPrice: 60.27 },
      { key: "potato", title: "Potato", quantity: 4, unit: "kg", unitPrice: 19.76 },
      { key: "garlic", title: "Garlic", quantity: 4, unit: "250 g pack", unitPrice: 41.5 },
      { key: "dry-coconut", title: "Dry Coconut", quantity: 2, unit: "200 g pack", unitPrice: 118.75 },
      { key: "pickle", title: "Mixed Pickle", quantity: 2, unit: "400 g jar", unitPrice: 110.5 },
      { key: "soap", title: "Toilet Soap", quantity: 8, unit: "bars", unitPrice: 40 },
      { key: "toothpaste", title: "Tooth Paste", quantity: 3, unit: "pack", unitPrice: 97 },
      { key: "washing", title: "Washing Soap", quantity: 6, unit: "bars", unitPrice: 22 },
      { key: "detergent", title: "Detergent Powder", quantity: 3, unit: "kg", unitPrice: 90 },
      { key: "dettol", title: "Dettol", quantity: 2, unit: "250 ml", unitPrice: 140.54 },
      { key: "toilet-cleaner", title: "Toilet Cleaner", quantity: 2, unit: "btl", unitPrice: 95 }
    ]
  }
];

export function normalizeSubscriptionCategory(input) {
  const raw = String(input?.name || input || "").trim().toLowerCase();
  if (raw.includes("flower")) return "flowers";
  if (raw.includes("grocery") || raw.includes("pickle")) return "groceries";
  if (raw.includes("pet")) return "pet_services";
  return raw || "general";
}

export function needsFrequency(category) {
  return ["flowers", "pet_services"].includes(normalizeSubscriptionCategory(category));
}

export function getDurationConfig(duration) {
  return SUBSCRIPTION_DURATIONS.find((item) => item.value === duration) || SUBSCRIPTION_DURATIONS[0];
}

export function getFrequencyConfig(frequency) {
  return SUBSCRIPTION_FREQUENCIES.find((item) => item.value === frequency) || null;
}

export function getGroceryPlan(planType) {
  const normalized = String(planType || "").trim().toLowerCase();
  const aliases = {
    pro: "advanced",
    vip: "premium"
  };
  const resolved = aliases[normalized] || normalized;
  return GROCERY_PLANS.find((item) => item.value === resolved) || GROCERY_PLANS[0];
}

export function calculateSubscriptionPreview({ category, duration, frequency, planType, items }) {
  const normalizedCategory = normalizeSubscriptionCategory(category);
  const durationConfig = getDurationConfig(duration);
  const frequencyConfig = getFrequencyConfig(frequency);
  const plan = getGroceryPlan(planType);

  const normalizedItems = (Array.isArray(items) ? items : []).map((item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    return {
      ...item,
      quantity,
      unitPrice,
      lineTotal: Number((quantity * unitPrice).toFixed(2))
    };
  });

  const baseSubtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  let cycleMultiplier = 1;
  if (frequencyConfig?.occurrencesPerMonth) {
    cycleMultiplier = frequencyConfig.occurrencesPerMonth;
  } else if (needsFrequency(normalizedCategory) && frequencyConfig) {
    cycleMultiplier = (frequencyConfig.multiplier || 1) * 7;
  }
  const cycleSubtotal = Number((baseSubtotal * cycleMultiplier).toFixed(2));
  const durationBasePrice = Number((cycleSubtotal * durationConfig.months).toFixed(2));
  const discountedPrice = Number((durationBasePrice * (1 - durationConfig.discountPercent / 100)).toFixed(2));

  return {
    category: normalizedCategory,
    duration: durationConfig.value,
    durationLabel: durationConfig.label,
    frequency: frequencyConfig?.value || null,
    frequencyLabel: frequencyConfig?.label || null,
    planType: plan?.value || null,
    planLabel: plan?.label || null,
    itemCount: normalizedItems.length,
    cycleSubtotal,
    durationBasePrice,
    totalPayable: discountedPrice,
    savings: Number((durationBasePrice - discountedPrice).toFixed(2)),
    discountPercent: durationConfig.discountPercent,
    items: normalizedItems
  };
}
