import { useMemo, useState } from "react";
import SubscriptionPopup from "./subscription/SubscriptionPopup";
import { normalizeSubscriptionCategory } from "./subscription/subscriptionConfig";

export function savePendingSubscriptionDraft(payload) {
  localStorage.setItem("pendingSubscriptionDraft", JSON.stringify(payload));
}

export function readPendingSubscriptionDraft() {
  try {
    const raw = localStorage.getItem("pendingSubscriptionDraft");
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

export function clearPendingSubscriptionDraft() {
  localStorage.removeItem("pendingSubscriptionDraft");
}

export default function SubscriptionWidget({ product, quantity = 1, onAddToBag }) {
  const [open, setOpen] = useState(false);
  const category = useMemo(
    () => normalizeSubscriptionCategory(product?.category || product?.Category?.name || ""),
    [product]
  );
  const supported = ["flowers", "groceries", "ration", "pet_services"].includes(category);

  if (!supported || !product) {
    return null;
  }

  const handleConfirmed = async ({ draft, items, pricing }) => {
    savePendingSubscriptionDraft({
      id: draft?.id,
      productId: product.id,
      category,
      quantity,
      pricing,
      items,
      savedAt: new Date().toISOString()
    });
    if (typeof onAddToBag === "function") {
      await onAddToBag();
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "linear-gradient(135deg, #C8102E 0%, #9f1239 100%)",
          color: "#fff",
          padding: "10px 14px",
          border: "none",
          borderRadius: 10,
          fontWeight: 800,
          cursor: "pointer"
        }}
      >
        Subscribe & Save
      </button>
      <SubscriptionPopup
        open={open}
        onClose={() => setOpen(false)}
        product={product}
        quantity={quantity}
        onConfirmed={handleConfirmed}
      />
    </div>
  );
}
