import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { useAuth } from "../context/AuthContext";
import CartPanel from "../components/CartPanel";

export default function Subscriptions() {
  const [plans, setPlans] = useState({ monthly: [], yearly: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/subscriptions/plans`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load subscription plans");
        const data = await res.json();
        if (mounted) setPlans({ monthly: data.monthly || [], yearly: data.yearly || [] });
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load subscription plans");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const subscribeToPlan = async (productId, period) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, period })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to subscribe");
      alert("Subscription activated successfully!");
    } catch (err) {
      setError(err.message || "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPlanCard = (plan, period) => {
    const priceKey = period === "monthly" ? "monthlyPrice" : "yearlyPrice";
    const priceLabel = period === "monthly" ? "per month" : "per year";
    const price = plan[priceKey];
    return (
      <div
        key={`${period}-${plan.id}`}
        style={{
          background: "#FFF9C4",
          borderRadius: 12,
          padding: 12,
          border: "1px solid #F2D060",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        <div style={{ fontWeight: 700, color: "#C8102E" }}>{plan.title}</div>
        {plan.category?.name && (
          <div style={{ fontSize: 12, color: "#777" }}>{plan.category.name}</div>
        )}
        <div style={{ fontSize: 14, color: "#111" }}>
          ₹{price} <span style={{ color: "#666", fontSize: 12 }}>{priceLabel}</span>
        </div>
        {(plan.unit || plan.variety) && (
          <div style={{ fontSize: 12, color: "#555" }}>
            {[plan.variety, plan.unit].filter(Boolean).join(" · ")}
          </div>
        )}
        <button
          disabled={submitting}
          onClick={() => subscribeToPlan(plan.id, period)}
          style={{
            marginTop: "auto",
            background: submitting ? "#ccc" : "#C8102E",
            color: "#fff",
            border: "none",
            padding: "8px 10px",
            borderRadius: 8,
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: 600
          }}
        >
          Subscribe {period === "monthly" ? "Monthly" : "Yearly"}
        </button>
      </div>
    );
  };

  return (
    <div className="with-cart-panel" style={{ minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 12, color: "#C8102E" }}>Subscriptions</h1>
        <p style={{ marginBottom: 24, color: "#555" }}>
          Subscribe to essentials, services, and consultancy packages for monthly or yearly delivery.
        </p>

        {loading && <div>Loading subscription plans…</div>}
        {error && <div style={{ color: "#C8102E", marginBottom: 12 }}>{error}</div>}

        {!loading && (
          <>
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ marginBottom: 12 }}>Monthly Plans</h2>
              {plans.monthly.length === 0 ? (
                <div style={{ color: "#777" }}>No monthly subscriptions available yet.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {plans.monthly.map((plan) => renderPlanCard(plan, "monthly"))}
                </div>
              )}
            </section>

            <section>
              <h2 style={{ marginBottom: 12 }}>Yearly Plans</h2>
              {plans.yearly.length === 0 ? (
                <div style={{ color: "#777" }}>No yearly subscriptions available yet.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {plans.yearly.map((plan) => renderPlanCard(plan, "yearly"))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <div style={{ position: "sticky", top: 32, alignSelf: "flex-start", height: "fit-content", zIndex: 10 }}>
        <CartPanel />
      </div>
    </div>
  );
}
