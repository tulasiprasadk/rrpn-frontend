import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryLayout from "../components/CategoryLayout";
import SubscriptionPopup from "../components/subscription/SubscriptionPopup";
import api from "../api/client";
import { normalizeSubscriptionCategory } from "../components/subscription/subscriptionConfig";

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/subscriptions/plans");
        const planProducts = Array.isArray(res.data?.plans) ? res.data.plans : [];
        if (!mounted) return;
        setProducts(planProducts);
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || err.message || "Failed to load subscription products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const listedProducts = useMemo(() => {
    const excluded = ["crackers", "local services", "consultancy"];
    return products
      .filter((product) => {
        const category = normalizeSubscriptionCategory(product.category?.name || product.category || "");
        return !excluded.includes(category);
      })
      .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }, [products]);

  const startSubscriptionPayment = async ({ draft, items, pricing }) => {
    try {
      const addressRes = await api.get("/customer/address");
      const addresses = Array.isArray(addressRes.data) ? addressRes.data : [];
      const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0] || null;
      if (!defaultAddress) {
        alert("Please save a delivery address before starting a subscription payment.");
        navigate("/address");
        return;
      }

      const orderRes = await api.post("/orders/create", {
        productId: activeProduct.id,
        qty: 1,
        subscriptionDraftId: draft?.id,
        addressId: defaultAddress.id,
        customerName: defaultAddress.name || "",
        customerPhone: defaultAddress.phone || "",
        customerAddress: buildAddressText(defaultAddress),
        promoCode: null,
        discount: 0
      });

      navigate("/payment", {
        state: {
          orderId: orderRes.data.orderId,
          orderDetails: orderRes.data,
          subscriptionDraft: {
            id: draft?.id,
            pricing,
            items,
            productId: activeProduct.id
          }
        }
      });
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to start subscription payment");
    }
  };

  return (
    <CategoryLayout title="Subscriptions" category="subscriptions">
      <div style={{ padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 10, color: "#C8102E" }}>Subscriptions</h1>
        <p style={{ marginBottom: 10, color: "#555" }}>
          Keep it compact: choose a product first, configure the subscription in a popup, then continue to payment.
        </p>
        <p style={{ marginBottom: 24, color: "#7a2034", fontWeight: 700 }}>
          Subscription activates only after payment is verified and approved.
        </p>

        {loading && <div>Loading subscription products...</div>}
        {error && <div style={{ color: "#C8102E", marginBottom: 12 }}>{error}</div>}

        {!loading && !error && listedProducts.length === 0 && (
          <div style={{ color: "#777" }}>No subscription products available yet.</div>
        )}

        {!loading && listedProducts.length > 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            {listedProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "#FFF9C4",
                  borderRadius: 14,
                  padding: 16,
                  border: "1px solid #F2D060",
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1.2fr) minmax(160px, 0.8fr) auto",
                  gap: 14,
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "#C8102E", fontSize: 20 }}>{product.title}</div>
                  <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                    {product.category?.name || "Category"} {product.unit ? `| ${product.unit}` : ""}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#5A3A00", fontWeight: 800 }}>
                    Base price: Rs {Number(product.price || 0).toFixed(2)}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "#8b5e00" }}>
                    Configure duration, frequency, plan, and upsell inside the popup.
                  </div>
                </div>

                <button
                  onClick={() => setActiveProduct(product)}
                  style={{
                    background: "#C8102E",
                    color: "#fff",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: 800,
                    minWidth: 180
                  }}
                >
                  Configure Subscription
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <SubscriptionPopup
        open={Boolean(activeProduct)}
        onClose={() => setActiveProduct(null)}
        product={activeProduct}
        quantity={1}
        onConfirmed={startSubscriptionPayment}
      />
    </CategoryLayout>
  );
}
