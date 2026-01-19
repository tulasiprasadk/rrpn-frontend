import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [subscriptionProductId, setSubscriptionProductId] = useState(null);
  const [subscribeError, setSubscribeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const product = data?.Product || data?.product || null;
        if (!product || !mounted) return;
        const options = [];
        if (product.hasMonthlyPackage) options.push("monthly");
        if (product.hasYearlyPackage) options.push("yearly");
        setSubscriptionOptions(options);
        setSubscriptionProductId(product.id || data?.productId || null);
      } catch {
        // Ignore failures to keep success page clean
      }
    })();
    return () => { mounted = false; };
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: subscriptionProductId, period })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to subscribe");
      }
      alert("Subscription activated successfully!");
    } catch (err) {
      setSubscribeError(err.message || "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="os-container">
      <div className="os-card">
        <div className="os-icon">✔</div>

        <h1>Order Placed Successfully!</h1>
        <p>Your order has been placed and is now being processed.</p>

        {orderId && (
          <p className="os-order-id">
            Order ID: <strong>{orderId}</strong>
          </p>
        )}

        {subscriptionOptions.length > 0 && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#FFF3B0", color: "#5A3A00" }}>
            <strong>Subscribe & Save</strong>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              Keep this item on auto-delivery with a subscription.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {subscriptionOptions.map((option) => (
                <button
                  key={option}
                  className="os-btn"
                  disabled={submitting}
                  onClick={() => subscribeNow(option)}
                  style={{ background: "#C8102E" }}
                >
                  Subscribe {option === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
            {subscribeError && (
              <div style={{ marginTop: 8, color: "#C8102E", fontSize: 13 }}>{subscribeError}</div>
            )}
          </div>
        )}

        <button className="os-btn" onClick={() => navigate("/orders")}>
          View My Orders
        </button>

        <button className="os-home" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}



