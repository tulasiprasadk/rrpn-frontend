import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { useAuth } from "../context/AuthContext";
import "./PaymentSubmitted.css";

const PLAN_LABELS = {
  monthly: "Monthly",
  quarterly: "3 Months",
  half_yearly: "6 Months",
  yearly: "Yearly"
};

function buildPlans(basePrice) {
  const normalizedPrice = Number(basePrice || 0);
  if (normalizedPrice <= 0) return [];

  return [
    { period: "monthly", label: "Monthly", discountPercent: 5, months: 1 },
    { period: "quarterly", label: "3 Months", discountPercent: 7, months: 3 },
    { period: "half_yearly", label: "6 Months", discountPercent: 9, months: 6 },
    { period: "yearly", label: "Yearly", discountPercent: 12, months: 12 }
  ].map((plan) => {
    const baseCyclePrice = normalizedPrice * plan.months;
    const discountedPrice = Number((baseCyclePrice * (1 - plan.discountPercent / 100)).toFixed(2));
    return {
      ...plan,
      discountedPrice,
      savings: Number((baseCyclePrice - discountedPrice).toFixed(2))
    };
  });
}

export default function PaymentSubmitted() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [subscriptionProductId, setSubscriptionProductId] = useState(null);
  const [subscribeError, setSubscribeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const candidate = state?.subscriptionCandidate || null;
    if (candidate?.basePrice > 0) {
      setSubscriptionPlans(buildPlans(candidate.basePrice));
      setSubscriptionProductId(candidate.productId || null);
    }

    if (!state?.orderId) return;
    let mounted = true;

    (async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("customerToken");
        const res = await fetch(`${API_BASE}/orders/${state.orderId}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) return;
        const data = await res.json();
        const product = data?.Product || data?.product || null;
        if (!product || !mounted) return;

        const basePrice = Number(product.price || 0);
        if (basePrice <= 0) return;

        setSubscriptionPlans(buildPlans(basePrice));
        setSubscriptionProductId(product.id || data?.productId || null);
      } catch (_err) {
        // Keep page usable even if subscription fetch fails
      }
    })();

    return () => {
      mounted = false;
    };
  }, [state?.orderId]);

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
    <div className="payment-submitted-page">
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>OK</div>

        <h2 style={{ color: "#28a745", marginBottom: "20px", fontSize: "28px" }}>
          Payment Received
        </h2>

        <p style={{ fontSize: "18px", color: "#666", marginBottom: "30px" }}>
          Your payment has been submitted successfully and your order is in process.
        </p>

        <div
          style={{
            background: "#f8f9fa",
            padding: "25px",
            borderRadius: "12px",
            border: "2px solid #e9ecef",
            marginBottom: "30px"
          }}
        >
          {state?.orderId && (
            <p style={{ marginBottom: "15px" }}>
              <strong>Order ID:</strong> <span style={{ color: "#007bff" }}>#{state.orderId}</span>
            </p>
          )}

          {state?.txnId && (
            <p style={{ marginBottom: "15px" }}>
              <strong>Transaction ID:</strong> <span style={{ color: "#007bff" }}>{state.txnId}</span>
            </p>
          )}

          {state?.screenshot && (
            <div style={{ marginTop: "20px" }}>
              <img
                src={state.screenshot}
                alt="Payment proof"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  border: "1px solid #ddd",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}
        </div>

        {subscriptionPlans.length > 0 && (
          <div
            style={{
              marginBottom: "30px",
              padding: 16,
              borderRadius: 14,
              background: "#fff3b0",
              color: "#5A3A00",
              textAlign: "left"
            }}
          >
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
                    onClick={() => subscribeNow(plan.period)}
                    disabled={submitting}
                    style={{
                      padding: "10px 16px",
                      background: "#C8102E",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontWeight: 700
                    }}
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

        <div
          style={{
            background: "#fff3cd",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ffc107",
            marginBottom: "30px",
            textAlign: "left"
          }}
        >
          <h3 style={{ color: "#856404", marginBottom: "15px", fontSize: "18px" }}>What Happens Next</h3>
          <ul style={{ color: "#856404", paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>We verify your payment and approve the order</li>
            <li>You will get a notification once verification is complete</li>
            <li>We prepare and deliver your items as scheduled</li>
            <li>Track status anytime in My Orders</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 30px",
              background: "#ffd600",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#333"
            }}
          >
            Go to Home
          </button>

          <button
            onClick={() => navigate("/my-orders")}
            style={{
              padding: "12px 30px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            View My Orders
          </button>
        </div>

        <p style={{ marginTop: "30px", color: "#999", fontSize: "14px" }}>
          Need help? Contact us at support@rrnagar.com
        </p>
      </div>
    </div>
  );
}
