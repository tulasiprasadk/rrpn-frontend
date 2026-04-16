import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import DurationDropdown from "./DurationDropdown";
import FrequencyDropdown from "./FrequencyDropdown";
import GroceryPlanSelector from "./GroceryPlanSelector";
import UpsellMultiSelect from "./UpsellMultiSelect";
import {
  calculateSubscriptionPreview,
  GROCERY_PLANS,
  normalizeSubscriptionCategory,
  needsFrequency,
  SUBSCRIPTION_DURATIONS,
  SUBSCRIPTION_FREQUENCIES
} from "./subscriptionConfig";
import "./SubscriptionPopup.css";

function buildBaseItem(product, quantity = 1) {
  return {
    productId: product.id,
    title: product.title || product.name || "Subscription item",
    quantity: Number(quantity || 1),
    unitPrice: Number(product.price || product.basePrice || 0),
    unit: product.unit || ""
  };
}

export default function SubscriptionPopup({ open, onClose, product, quantity = 1, onConfirmed }) {
  const category = normalizeSubscriptionCategory(product?.category || product?.Category?.name || "");
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState(SUBSCRIPTION_FREQUENCIES[0].value);
  const [duration, setDuration] = useState(SUBSCRIPTION_DURATIONS[0].value);
  const [planType, setPlanType] = useState(GROCERY_PLANS[0].value);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [groceryItems, setGroceryItems] = useState(GROCERY_PLANS[0].items);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedUpsell, setSelectedUpsell] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) return;
    setEnabled(true);
    setDuration(SUBSCRIPTION_DURATIONS[0].value);
    setFrequency(SUBSCRIPTION_FREQUENCIES[0].value);
    setPlanType(GROCERY_PLANS[0].value);
    setGroceryItems(GROCERY_PLANS[0].items);
    setSelectedUpsell([]);
    setError("");

    if (["flowers", "pet_services"].includes(category)) {
      api
        .get("/subscriptions/plans")
        .then((res) => {
          const rows = Array.isArray(res.data?.plans) ? res.data.plans : [];
          const sameCategory = rows
            .filter((item) => normalizeSubscriptionCategory(item.category?.name || item.category || "") === category)
            .filter((item) => Number(item.id) !== Number(product.id))
            .slice(0, 3);
          setRecommendations(sameCategory);
        })
        .catch(() => setRecommendations([]));
    } else {
      setRecommendations([]);
    }
  }, [open, product?.id, category]);

  const selectedPlan = useMemo(
    () => GROCERY_PLANS.find((plan) => plan.value === planType) || GROCERY_PLANS[0],
    [planType]
  );

  const draftItems = useMemo(() => {
    if (!product) return [];

    if (category === "groceries") {
      return groceryItems.map((item) => ({
        title: item.title,
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        unit: item.unit,
        metadata: { source: "grocery_plan", key: item.key, title: item.title, unit: item.unit }
      }));
    }

    const upsellItems = recommendations
      .filter((item) => selectedUpsell.includes(item.id))
      .map((item) => ({
        productId: item.id,
        title: item.title,
        quantity: 1,
        unitPrice: Number(item.price || 0),
        unit: item.unit || ""
      }));

    return [buildBaseItem(product, quantity), ...upsellItems];
  }, [category, groceryItems, product, quantity, recommendations, selectedUpsell]);

  const pricing = useMemo(
    () =>
      calculateSubscriptionPreview({
        category,
        duration,
        frequency,
        planType,
        items: draftItems
      }),
    [category, duration, frequency, planType, draftItems]
  );

  const toggleUpsell = (item) => {
    setSelectedUpsell((current) =>
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
    );
  };

  const handlePlanChange = (nextPlanType) => {
    const nextPlan = GROCERY_PLANS.find((plan) => plan.value === nextPlanType) || GROCERY_PLANS[0];
    setPlanType(nextPlanType);
    setGroceryItems(nextPlan.items);
  };

  const handleGroceryQtyChange = (key, nextValue) => {
    const quantityValue = Math.max(1, Number(nextValue || 1));
    setGroceryItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: quantityValue } : item))
    );
  };

  const handleConfirm = async () => {
    if (!enabled) {
      onClose();
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        category,
        primaryProductId: product.id,
        duration,
        frequency: needsFrequency(category) ? frequency : null,
        planType: category === "groceries" ? planType : null,
        source: "product_popup",
        upsellAccepted: selectedUpsell.length > 0,
        recommendationIds: selectedUpsell,
        items: draftItems
      };
      const res = await api.post("/subscription/create", payload);
      onConfirmed?.({
        draft: res.data?.subscription,
        items: res.data?.items || [],
        pricing: res.data?.pricing || pricing
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to prepare subscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div className="subscription-popup__backdrop" onClick={onClose}>
      <div className="subscription-popup__modal" onClick={(event) => event.stopPropagation()}>
        <div className="subscription-popup__header">
          <div>
            <div className="subscription-popup__eyebrow">
              {category === "groceries" ? "Subscribe Monthly Ration" : "Subscribe & Save More"}
            </div>
            <div className="subscription-popup__title">Subscribe & Save More</div>
            <div className="subscription-popup__subtitle">
              Keep this flow guided: switch it on, choose the cycle, optionally add related items, and carry everything into payment in one go.
            </div>
          </div>
          <button type="button" className="subscription-popup__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="subscription-popup__steps">
          <div className="subscription-popup__card subscription-popup__toggle-row">
            <label className="subscription-popup__toggle">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              Enable subscription for this item
            </label>
            <div className="subscription-popup__section-subtitle">
              We will save the setup now and attach it to payment approval later.
            </div>
          </div>

          {enabled && (
            <>
              <div className="subscription-popup__card">
                <div className="subscription-popup__section-title">Step 1. Choose your cycle</div>
                <div className="subscription-popup__selectors">
                  {needsFrequency(category) && (
                    <FrequencyDropdown
                      value={frequency}
                      options={SUBSCRIPTION_FREQUENCIES}
                      onChange={setFrequency}
                    />
                  )}
                  <DurationDropdown
                    value={duration}
                    options={SUBSCRIPTION_DURATIONS}
                    onChange={setDuration}
                  />
                </div>
              </div>

              {category === "groceries" ? (
                <GroceryPlanSelector
                  value={planType}
                  plans={GROCERY_PLANS}
                  onChange={handlePlanChange}
                  expanded={planExpanded}
                  onToggleExpanded={() => setPlanExpanded((current) => !current)}
                  selectedPlan={selectedPlan}
                  onQuantityChange={handleGroceryQtyChange}
                />
              ) : (
                <UpsellMultiSelect
                  title={category === "pet_services" ? "Add more services" : "Add more flowers to your subscription"}
                  subtitle="Choose only a few related items. We keep the list short so the popup stays easy to scan."
                  items={recommendations}
                  selectedIds={selectedUpsell}
                  onToggle={toggleUpsell}
                />
              )}
            </>
          )}
        </div>

        <div className="subscription-popup__summary">
          <div className="subscription-popup__eyebrow">Live pricing</div>
          <div className="subscription-popup__price">Rs {Number(pricing.totalPayable || 0).toFixed(2)}</div>
          <div className="subscription-popup__meta">
            Save Rs {Number(pricing.savings || 0).toFixed(2)} across {pricing.durationLabel}
            {pricing.frequencyLabel ? ` | ${pricing.frequencyLabel}` : ""}
            {pricing.planLabel ? ` | ${pricing.planLabel}` : ""}
          </div>
          <div className="subscription-popup__meta">
            {pricing.itemCount} item{pricing.itemCount === 1 ? "" : "s"} included
          </div>
        </div>

        <div className="subscription-popup__footer">
          <div className="subscription-popup__error">{error}</div>
          <div className="subscription-popup__actions">
            <button type="button" className="subscription-popup__button subscription-popup__button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="subscription-popup__button subscription-popup__button--primary"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Preparing..." : "Confirm & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
