import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { useAuth } from "../context/AuthContext";
import CartPanel from "../components/CartPanel";
import api from "../api/client";

const PLAN_SECTIONS = [
  { key: "monthly", title: "Monthly Plans", empty: "No monthly subscriptions available yet." },
  { key: "quarterly", title: "3 Month Plans", empty: "No 3 month subscriptions available yet." },
  { key: "half_yearly", title: "6 Month Plans", empty: "No 6 month subscriptions available yet." },
  { key: "yearly", title: "Yearly Plans", empty: "No yearly subscriptions available yet." }
];

function buildAddressText(address) {
  return [
    address?.addressLine,
    address?.city,
    address?.state,
    address?.pincode ? `- ${address.pincode}` : ""
  ]
    .filter(Boolean)
    .join(", ");
}

export default function Subscriptions() {
  const [plans, setPlans] = useState({
    monthly: [],
    quarterly: [],
    half_yearly: [],
    yearly: []
  });
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
        if (mounted) {
          setPlans({
            monthly: data.monthly || [],
            quarterly: data.quarterly || [],
            half_yearly: data.half_yearly || [],
            yearly: data.yearly || []
          });
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load subscription plans");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const subscribeToPlan = async (plan) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const [addressRes, profileRes] = await Promise.all([
        api.get("/customer/address"),
        api.get("/customer/profile").catch(() => ({ data: {} }))
      ]);

      const addresses = Array.isArray(addressRes.data) ? addressRes.data : [];
      const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0] || null;

      if (!defaultAddress) {
        alert("Please save a delivery address before starting a subscription payment.");
        navigate("/address");
        return;
      }

      const profile = profileRes.data || {};
      const orderPayload = {
        productId: plan.id,
        qty: 1,
        addressId: defaultAddress.id,
        customerName: defaultAddress.name || profile.name || user?.name || "",
        customerPhone: defaultAddress.phone || profile.mobile || profile.username || user?.phone || "",
        customerAddress: buildAddressText(defaultAddress),
        promoCode: null,
        discount: 0,
      };

      const orderRes = await api.post("/orders/create", orderPayload);

      navigate("/payment", {
        state: {
          orderId: orderRes.data.orderId,
          orderDetails: orderRes.data,
          selectedSubscriptionPeriod: plan.period,
          subscriptionCandidate: {
            productId: plan.id,
            title: plan.title,
            basePrice: Number(plan.price || 0),
            quantity: 1,
          },
        }
      });
    } catch (err) {
      console.error("Subscription payment start failed:", err);
      setError(err.response?.data?.error || err.message || "Failed to start subscription payment");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPlanCard = (plan) => (
    <div
      key={`${plan.period}-${plan.id}`}
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
        Rs {Number(plan.discountedPrice || 0).toFixed(2)}{" "}
        <span style={{ color: "#666", fontSize: 12 }}>
          for {plan.label.toLowerCase()}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "#555" }}>
        Save {plan.discountPercent}% (Rs {Number(plan.savings || 0).toFixed(2)})
      </div>
      <div style={{ fontSize: 13, color: "#7a2034", fontWeight: 600 }}>
        Pay now. Subscription starts after payment approval.
      </div>
      {(plan.unit || plan.variety) && (
        <div style={{ fontSize: 12, color: "#555" }}>
          {[plan.variety, plan.unit].filter(Boolean).join(" | ")}
        </div>
      )}
      <button
        disabled={submitting}
        onClick={() => subscribeToPlan(plan)}
        style={{
          marginTop: "auto",
          background: submitting ? "#ccc" : "#C8102E",
          color: "#fff",
          border: "none",
          padding: "8px 10px",
          borderRadius: 8,
          cursor: submitting ? "not-allowed" : "pointer",
          fontWeight: 700
        }}
      >
        {submitting ? "Preparing..." : `Continue to Payment`}
      </button>
    </div>
  );

  return (
    <div className="with-cart-panel" style={{ minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 12, color: "#C8102E" }}>Subscriptions</h1>
        <p style={{ marginBottom: 24, color: "#555" }}>
          Choose your recurring plan here, then complete payment. The subscription becomes active only after payment is verified and approved.
        </p>

        {loading && <div>Loading subscription plans...</div>}
        {error && <div style={{ color: "#C8102E", marginBottom: 12 }}>{error}</div>}

        {!loading &&
          PLAN_SECTIONS.map((section) => (
            <section key={section.key} style={{ marginBottom: 32 }}>
              <h2 style={{ marginBottom: 12 }}>{section.title}</h2>
              {plans[section.key].length === 0 ? (
                <div style={{ color: "#777" }}>{section.empty}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {plans[section.key].map((plan) => renderPlanCard(plan))}
                </div>
              )}
            </section>
          ))}
      </div>
      <div style={{ position: "sticky", top: 32, alignSelf: "flex-start", height: "fit-content", zIndex: 10 }}>
        <CartPanel />
      </div>
    </div>
  );
}
