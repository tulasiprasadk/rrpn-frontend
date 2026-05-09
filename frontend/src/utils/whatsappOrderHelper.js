const DEFAULT_WHATSAPP_NUMBER =
  (import.meta.env?.VITE_WHATSAPP_NUMBER || "919844007900").toString();

function digitsOnly(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function getItemTitle(item) {
  return item?.product_name || item?.productName || item?.title || item?.name || "Product";
}

function getItemQty(item) {
  return Number(item?.quantity ?? item?.qty ?? 1) || 1;
}

function getItemPrice(item) {
  return Number(item?.price ?? item?.basePrice ?? item?.amount ?? 0) || 0;
}

export function normalizeWhatsAppCart(cartInput) {
  const items = Array.isArray(cartInput)
    ? cartInput
    : Array.isArray(cartInput?.items)
      ? cartInput.items
      : [];

  return items.map((item) => ({
    ...item,
    title: getItemTitle(item),
    quantity: getItemQty(item),
    price: getItemPrice(item),
  }));
}

export function buildWhatsAppOrderMessage({
  user,
  cart,
  address,
  slot,
  subscription,
  note,
  promoCode,
  discount = 0,
} = {}) {
  const items = normalizeWhatsAppCart(cart);
  if (!items.length) {
    return "";
  }

  const customerName = user?.name || user?.fullName || user?.customerName || "";
  const customerPhone = user?.phone || user?.mobile || user?.customerPhone || "";
  const addressText =
    typeof address === "string"
      ? address
      : [
          address?.name ? `Name: ${address.name}` : "",
          address?.phone ? `Phone: ${address.phone}` : "",
          address?.addressLine || address?.street || address?.line1 || "",
          address?.city || "",
          address?.state || "",
          address?.pincode ? `PIN: ${address.pincode}` : "",
        ]
          .filter(Boolean)
          .join(", ");

  const itemsList = items
    .map((item, index) => {
      const qty = getItemQty(item);
      const price = getItemPrice(item);
      const subtotal = qty * price;
      return `${index + 1}. ${getItemTitle(item)} x ${qty} - INR ${subtotal.toFixed(2)}`;
    })
    .join("\n");

  const cartTotal = items.reduce((sum, item) => sum + getItemPrice(item) * getItemQty(item), 0);
  const subscriptionTotal = Number(subscription?.total || subscription?.pricing?.totalPayable || 0) || 0;
  const total = Math.max(cartTotal + subscriptionTotal - Number(discount || 0), 0);

  const sections = [
    "New RR Nagar order request",
    customerName ? `Customer: ${customerName}` : "",
    customerPhone ? `Phone: ${customerPhone}` : "",
    addressText ? `Delivery Address: ${addressText}` : "Delivery Address: Please confirm",
    "",
    "Items:",
    itemsList,
    "",
    promoCode ? `Promo Code: ${promoCode}` : "",
    Number(discount || 0) > 0 ? `Discount: INR ${Number(discount).toFixed(2)}` : "",
    subscription ? `Subscription: ${subscription.type || subscription.category || "Attached"}` : "",
    `Total: INR ${total.toFixed(2)}`,
    slot ? `Preferred Delivery Slot: ${slot}` : "Preferred Delivery Slot: Please confirm",
    note ? `Note: ${note}` : "",
    "",
    "Please confirm availability, delivery time, and payment details.",
  ];

  return sections.filter((line, index) => line || sections[index - 1]).join("\n").trim();
}

export function buildWhatsAppOrderUrl(orderDetails = {}, whatsappNumber = DEFAULT_WHATSAPP_NUMBER) {
  const message = buildWhatsAppOrderMessage(orderDetails);
  const phoneDigits = digitsOnly(whatsappNumber);
  if (!message || !phoneDigits) {
    return "";
  }

  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppOrder(orderDetails = {}, whatsappNumber = DEFAULT_WHATSAPP_NUMBER) {
  const url = buildWhatsAppOrderUrl(orderDetails, whatsappNumber);
  if (!url) {
    alert("Your bag is empty");
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export const handleWhatsAppOrder = (user, cart, address, slot, subscription, whatsappNumber) => {
  return openWhatsAppOrder({ user, cart, address, slot, subscription }, whatsappNumber);
};
