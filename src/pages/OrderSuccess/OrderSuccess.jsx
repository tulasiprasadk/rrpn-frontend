import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const PLAN_LABELS = {
  monthly: "Monthly",
  quarterly: "3 Months",
  half_yearly: "6 Months",
  yearly: "Yearly"
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [subscriptionProductId, setSubscriptionProductId] = useState(null);
  const [subscribeError, setSubscribeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) return;
        const data = await res.json();
        const product = data?.Product || data?.product || null;
        if (!product || !mounted) return;

        const basePrice = Number(product.price || 0);
        if (basePrice <= 0) return;

        const plans = [
          { period: "monthly", label: "Monthly", discountPercent: 5, months: 1 },
          { period: "quarterly", label: "3 Months", discountPercent: 7, months: 3 },
          { period: "half_yearly", label: "6 Months", discountPercent: 9, months: 6 },
          { period: "yearly", label: "Yearly", discountPercent: 12, months: 12 }
        ].map((plan) => {
          const baseCyclePrice = basePrice * plan.months;
          const discountedPrice = Number((baseCyclePrice * (1 - plan.discountPercent / 100)).toFixed(2));
          return {
            ...plan,
            discountedPrice,
            savings: Number((baseCyclePrice - discountedPrice).toFixed(2))
          };
        });

        setSubscriptionPlans(plans);
        setSubscriptionProductId(product.id || data?.productId || null);
      } catch {
        // Ignore failures to keep success page clean
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const subscribeNow = async (period) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSubscribeError("");
    setSubmitting(true);
    try {
      if (!subscriptionProductId) {
        throw new Error("Subscription product not available");
      }
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {})
        },
        body: JSON.stringify({ productId: subscriptionProductId, period })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to subscribe");
      }
      alert("Subscription activated successfully!");
      setSubscribeError("");
    } catch (err) {
      setSubscribeError(err.message || "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="os-container">
      <div className="os-card">
        <div className="os-icon">OK</div>

        <h1>Order Placed Successfully!</h1>
        <p>Your order has been placed and is now being processed.</p>

        {orderId && (
          <p className="os-order-id">
            Order ID: <strong>{orderId}</strong>
          </p>
        )}

        {subscriptionPlans.length > 0 && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: "#fff3b0", color: "#5A3A00", textAlign: "left" }}>
            <strong>Subscribe and Save on future deliveries</strong>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              Get recurring delivery without reminders and unlock extra savings on this product.
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.period}
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {plan.label} subscription - {plan.discountPercent}% off
                    </div>
                    <div style={{ fontSize: 14 }}>
                      Pay Rs {plan.discountedPrice.toFixed(2)} and save Rs {plan.savings.toFixed(2)}
                    </div>
                  </div>
                  <button
                    className="os-btn"
                    disabled={submitting}
                    onClick={() => subscribeNow(plan.period)}
                    style={{ background: "#C8102E" }}
                  >
                    {submitting ? "Processing..." : `Choose ${PLAN_LABELS[plan.period]}`}
                  </button>
                </div>
              ))}
            </div>
            {subscribeError && (
              <div style={{ marginTop: 8, color: "#C8102E", fontSize: 13 }}>{subscribeError}</div>
            )}
          </div>
        )}

        <button className="os-btn" onClick={() => navigate("/my-orders")}>
          View My Orders
        </button>

        <button className="os-home" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
