export function parsePrice(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function applyMargin(price, marginPercent = 15) {
  const base = parsePrice(price);
  const margin = parsePrice(marginPercent);
  return Math.round((base + (base * margin) / 100) * 100) / 100;
}

export function formatPrice(value) {
  return `Rs ${parsePrice(value).toFixed(2)}`;
}
