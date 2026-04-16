import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import SubscriptionPrompt, {
  clearPendingSubscriptionCandidate,
  savePendingSubscriptionCandidate
} from "../components/SubscriptionPrompt";
import "./PaymentSubmitted.css";

const PLAN_LABELS = {
  monthly: "Monthly",
  quarterly: "3 Months",
  half_yearly: "6 Months",
  yearly: "Yearly"
};

export default function PaymentSubmitted() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const subscriptionDraft = state?.subscriptionDraft || null;
  const [subscriptionCandidate, setSubscriptionCandidate] = useState(state?.subscriptionCandidate || null);
  const selectedSubscriptionPeriod = state?.selectedSubscriptionPeriod || "";

  useEffect(() => {
    const candidate = state?.subscriptionCandidate || null;
    if (subscriptionDraft?.id) {
      clearPendingSubscriptionCandidate();
      setSubscriptionCandidate(null);
      return;
    }
    if (selectedSubscriptionPeriod && candidate?.productId) {
      clearPendingSubscriptionCandidate();
      setSubscriptionCandidate(null);
    } else if (candidate?.basePrice > 0 && candidate?.productId) {
      setSubscriptionCandidate(candidate);
      savePendingSubscriptionCandidate(candidate);
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

        const nextCandidate = {
          productId: product.id || data?.productId || null,
          title: product.title || product.name || "",
          basePrice,
          orderId: state.orderId
        };
        if (nextCandidate.productId && !selectedSubscriptionPeriod) {
          setSubscriptionCandidate(nextCandidate);
          savePendingSubscriptionCandidate(nextCandidate);
        }
      } catch (_err) {
        // Keep page usable even if subscription fetch fails
      }
    })();

    return () => {
      mounted = false;
    };
  }, [state?.orderId, selectedSubscriptionPeriod, subscriptionDraft?.id]);

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

        {subscriptionDraft?.pricing ? (
          <div
            style={{
              marginBottom: 24,
              padding: 22,
              borderRadius: 18,
              background: "linear-gradient(135deg, #fff8cc 0%, #ffe78a 52%, #ffd55c 100%)",
              border: "1px solid rgba(210, 140, 0, 0.2)",
              boxShadow: "0 14px 40px rgba(194, 120, 0, 0.16)",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: "#9a3412" }}>
              Included With This Payment
            </div>
            <h3 style={{ margin: "8px 0 8px", fontSize: 30, lineHeight: 1.05, color: "#5A3A00" }}>
              Subscription request submitted
            </h3>
            <p style={{ margin: 0, color: "#6b3f00", lineHeight: 1.7, fontSize: 16 }}>
              We received your subscription setup together with this payment.
            </p>
            <div style={{ marginTop: 12, color: "#7a4b00", fontWeight: 700 }}>
              {subscriptionDraft.pricing.durationLabel}
              {subscriptionDraft.pricing.frequencyLabel ? ` | ${subscriptionDraft.pricing.frequencyLabel}` : ""}
              {subscriptionDraft.pricing.planLabel ? ` | ${subscriptionDraft.pricing.planLabel}` : ""}
            </div>
            <div style={{ marginTop: 6, color: "#7a4b00" }}>
              {subscriptionDraft.pricing.itemCount} item{subscriptionDraft.pricing.itemCount === 1 ? "" : "s"} | Payable Rs {Number(subscriptionDraft.pricing.totalPayable || 0).toFixed(2)}
            </div>
          </div>
        ) : selectedSubscriptionPeriod ? (
          <div
            style={{
              marginBottom: 24,
              padding: 22,
              borderRadius: 18,
              background: "linear-gradient(135deg, #fff8cc 0%, #ffe78a 52%, #ffd55c 100%)",
              border: "1px solid rgba(210, 140, 0, 0.2)",
              boxShadow: "0 14px 40px rgba(194, 120, 0, 0.16)",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: "#9a3412" }}>
              Included With This Payment
            </div>
            <h3 style={{ margin: "8px 0 8px", fontSize: 30, lineHeight: 1.05, color: "#5A3A00" }}>
              Subscribe and Forget is locked in
            </h3>
            <p style={{ margin: 0, color: "#6b3f00", lineHeight: 1.7, fontSize: 16 }}>
              Your <strong>{PLAN_LABELS[selectedSubscriptionPeriod] || selectedSubscriptionPeriod}</strong> subscription request has been submitted together with this payment.
              Once payment is approved, we will activate the plan, remind you before each cycle, and keep the recurring delivery on track.
            </p>
          </div>
        ) : (
          <SubscriptionPrompt initialCandidate={subscriptionCandidate} />
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
