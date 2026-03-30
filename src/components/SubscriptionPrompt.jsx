import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { useAuth } from "../context/AuthContext";

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

function readStoredCandidate() {
  try {
    const raw = localStorage.getItem("pendingSubscriptionCandidate");
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

function writeStoredCandidate(candidate) {
  if (!candidate) {
    localStorage.removeItem("pendingSubscriptionCandidate");
    return;
  }
  localStorage.setItem("pendingSubscriptionCandidate", JSON.stringify(candidate));
}

export function savePendingSubscriptionCandidate(candidate) {
  if (!candidate || !candidate.productId) return;
  writeStoredCandidate({
    ...candidate,
    savedAt: new Date().toISOString()
  });
}

export function clearPendingSubscriptionCandidate() {
  writeStoredCandidate(null);
}

export default function SubscriptionPrompt({ initialCandidate = null, compact = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(initialCandidate || null);
  const [plans, setPlans] = useState([]);
  const [subscribeError, setSubscribeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = readStoredCandidate();
    const nextCandidate = initialCandidate || stored || null;
    setCandidate(nextCandidate);
    setPlans(buildPlans(nextCandidate?.basePrice));
  }, [initialCandidate]);

  if (!candidate || plans.length === 0 || dismissed) {
    return null;
  }

  const closePrompt = () => {
    setDismissed(true);
  };

  const subscribeNow = async (period) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSubscribeError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {})
        },
        body: JSON.stringify({ productId: candidate.productId, period })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to subscribe");
      }

      clearPendingSubscriptionCandidate();
      setDismissed(true);
      alert("Subscription activated successfully!");
    } catch (err) {
      setSubscribeError(err.message || "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: compact ? 16 : 24,
        padding: compact ? 14 : 18,
        borderRadius: 14,
        background: "#fff3b0",
        color: "#5A3A00",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <strong>Subscribe and Save on {candidate.title || "this product"}</strong>
          <div style={{ marginTop: 6, fontSize: 14 }}>
            Get recurring delivery without reminders and unlock extra savings after your first purchase.
          </div>
        </div>
        <button
          onClick={closePrompt}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            color: "#5A3A00"
          }}
          aria-label="Dismiss subscription prompt"
        >
          x
        </button>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {plans.map((plan) => (
          <div
            key={plan.period}
            style={{
              background: "rgba(255,255,255,0.75)",
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
  );
}
