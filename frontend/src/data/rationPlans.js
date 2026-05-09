const BASE_25 = [
  ["Staples", "Rice", "10 kg"],
  ["Staples", "Atta", "10 kg"],
  ["Staples", "Rava", "1 kg"],
  ["Staples", "Poha", "1 kg"],
  ["Staples", "Maida", "1 kg"],
  ["Pulses", "Toor Dal", "2 kg"],
  ["Pulses", "Moong Dal", "1 kg"],
  ["Pulses", "Chana Dal", "1 kg"],
  ["Pulses", "Urad Dal", "1 kg"],
  ["Essentials", "Oil", "2 L"],
  ["Essentials", "Salt", "1 kg"],
  ["Essentials", "Sugar", "1 kg"],
  ["Essentials", "Jaggery", "1 kg"],
  ["Spices", "Turmeric", "100 g"],
  ["Spices", "Chilli Powder", "100 g"],
  ["Spices", "Coriander Powder", "100 g"],
  ["Spices", "Mustard Seeds", "100 g"],
  ["Spices", "Cumin Seeds", "100 g"],
  ["Vegetables", "Onion", "5 kg"],
  ["Vegetables", "Potato", "5 kg"],
  ["Vegetables", "Tomato", "3 kg"],
  ["Vegetables", "Garlic", "500 g"],
  ["Vegetables", "Ginger", "500 g"],
  ["Dairy", "Milk", "30 L"],
  ["Others", "Tea Powder", "500 g"]
];

const STANDARD_EXTRA = [
  ["Staples", "Vermicelli", "1 kg"],
  ["Staples", "Oats", "1 kg"],
  ["Staples", "Cornflakes", "1 kg"],
  ["Pulses", "Rajma", "1 kg"],
  ["Pulses", "Kabuli Chana", "1 kg"],
  ["Essentials", "Ghee", "1 kg"],
  ["Essentials", "Butter", "500 g"],
  ["Spices", "Garam Masala", "200 g"],
  ["Spices", "Sambar Powder", "200 g"],
  ["Extras", "Peanuts", "1 kg"],
  ["Extras", "Pickle", "1 kg"],
  ["Extras", "Papad", "1 kg"],
  ["Dairy", "Curd", "5 kg"],
  ["Snacks", "Biscuits", "10 packs"],
  ["Snacks", "Bread", "10 packs"]
];

const COMFORT_EXTRA = [
  ["Staples", "Millets", "3 kg"],
  ["Staples", "Quinoa", "1 kg"],
  ["Pulses", "Masoor Dal", "2 kg"],
  ["Essentials", "Honey", "500 g"],
  ["Spices", "Rasam Powder", "200 g"],
  ["Spices", "Chaat Masala", "100 g"],
  ["Extras", "Dry Fruits", "2 kg"],
  ["Extras", "Dates", "1 kg"],
  ["Dairy", "Paneer", "2 kg"],
  ["Dairy", "Cheese", "1 kg"],
  ["Snacks", "Noodles", "15 packs"],
  ["Snacks", "Namkeen", "2 kg"]
];

const PREMIUM_EXTRA = [
  ["Staples", "Basmati Rice", "25 kg"],
  ["Staples", "Multigrain Atta", "15 kg"],
  ["Staples", "Chia Seeds", "500 g"],
  ["Staples", "Flax Seeds", "500 g"],
  ["Pulses", "Organic Mixed Dal", "5 kg"],
  ["Essentials", "Olive Oil", "2 L"],
  ["Essentials", "Cold Pressed Oil", "3 L"],
  ["Essentials", "Brown Sugar", "2 kg"],
  ["Spices", "Whole Spices Mix", "500 g"],
  ["Extras", "Protein Bars", "1 kg"],
  ["Extras", "Granola", "2 kg"],
  ["Extras", "Peanut Butter", "1 kg"],
  ["Extras", "Jam", "1 kg"],
  ["Dairy", "Greek Yogurt", "2 kg"],
  ["Dairy", "Flavored Milk", "10 L"],
  ["Fruits", "Apples", "5 kg"],
  ["Fruits", "Bananas", "5 dozen"],
  ["Fruits", "Oranges", "5 kg"],
  ["Fruits", "Exotic Fruits", "5 kg"],
  ["Vegetables", "Green Vegetables", "15 kg"],
  ["Snacks", "Juices", "10 L"],
  ["Snacks", "Soft Drinks", "5 L"]
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseQuantity(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

  if (!match) {
    return {
      quantity: 1,
      unit: raw
    };
  }

  return {
    quantity: Number(match[1]),
    unit: match[2].trim()
  };
}

function buildItems(planValue, rows) {
  return rows.map(([section, title, quantityText], index) => {
    const parsed = parseQuantity(quantityText);
    return {
    key: `${planValue}-${slugify(title)}-${index + 1}`,
    title,
      quantity: parsed.quantity,
      unit: parsed.unit,
      quantityText,
    section,
      unitPrice: 0
    };
  });
}

function buildRationPlan({ value, title, badge, price, rows }) {
  const items = buildItems(value, rows);

  return {
    value,
    title,
    price,
    badge,
    itemCount: items.length,
    highlights: [badge, `${items.length} products`, "Monthly ration"],
    items
  };
}

export const RATION_BASKETS = [
  buildRationPlan({
    value: "basic",
    title: "Basic Ration",
    badge: "Daily Basics",
    price: 1499,
    rows: BASE_25
  }),
  buildRationPlan({
    value: "standard",
    title: "Standard Family",
    badge: "Family Plan",
    price: 2499,
    rows: [...BASE_25, ...STANDARD_EXTRA]
  }),
  buildRationPlan({
    value: "comfort",
    title: "Comfort Basket",
    badge: "Comfort Home",
    price: 3499,
    rows: [...BASE_25, ...STANDARD_EXTRA, ...COMFORT_EXTRA]
  }),
  buildRationPlan({
    value: "premium",
    title: "Premium Mega",
    badge: "Premium Basket",
    price: 4299,
    rows: [...BASE_25, ...STANDARD_EXTRA, ...COMFORT_EXTRA, ...PREMIUM_EXTRA]
  })
];

export function buildRationFallbackProducts() {
  return RATION_BASKETS.map((plan, index) => ({
    id: `ration-${plan.value}`,
    title: plan.title,
    price: plan.price,
    description: `${plan.badge} monthly ration basket with ${plan.itemCount} included products.`,
    category: "ration",
    unit: "basket",
    metadata: {
      badge: plan.badge,
      itemCount: plan.itemCount,
      sortOrder: index + 1,
      highlights: plan.highlights,
      items: plan.items
    },
    sortOrder: index + 1
  }));
}

export function buildDefaultSubscriptionProducts() {
  return [
    ...buildRationFallbackProducts(),
    {
      id: "flowers-weekly-mix",
      title: "Weekly Flower Basket",
      price: 299,
      description: "Fresh pooja and home flowers delivered on your selected schedule.",
      category: "flowers",
      unit: "basket",
      metadata: { badge: "Flowers" }
    },
    {
      id: "pet-home-visit",
      title: "Home Visit Vet Consultation",
      price: 799,
      description: "Scheduled pet care consultation at home.",
      category: "pet_services",
      unit: "visit",
      metadata: { badge: "Pet care" }
    },
    {
      id: "grocery-monthly-custom",
      title: "Custom Grocery Subscription",
      price: 999,
      description: "Build a monthly grocery subscription with editable quantities.",
      category: "groceries",
      unit: "plan",
      metadata: { badge: "Groceries" }
    }
  ];
}
