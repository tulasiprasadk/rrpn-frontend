import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryLayout from "../components/CategoryLayout";
import SubscriptionPopup from "../components/subscription/SubscriptionPopup";
import api from "../api/client";
import { fetchSubscriptionPlans } from "../api/subscriptionApi";
import { normalizeSubscriptionCategory } from "../components/subscription/subscriptionConfig";
import { useCrackerCart } from "../context/CrackerCartContext";
import { savePendingSubscriptionDraft } from "../components/SubscriptionWidget";

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

function getPlanCategory(product) {
  return normalizeSubscriptionCategory(product.category?.name || product.category || "");
}

function getRationItems(product) {
  let metadata = product.metadata || {};
  if (typeof metadata === "string") {
    try {
      metadata = JSON.parse(metadata || "{}");
    } catch (_err) {
      metadata = {};
    }
  }
  return Array.isArray(metadata.items) ? metadata.items : Array.isArray(product.items) ? product.items : [];
}

export default function Subscriptions() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();
  const { addItem } = useCrackerCart();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Use fetchSubscriptionPlans which has a built-in fallback when the backend times out
        const planProducts = await fetchSubscriptionPlans();
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
        const category = getPlanCategory(product);
        return !excluded.includes(category);
      })
      .sort((a, b) => {
        const categoryA = getPlanCategory(a);
        const categoryB = getPlanCategory(b);
        if (categoryA === "ration" && categoryB === "ration") {
          return Number(a.sortOrder || a.metadata?.sortOrder || 999) - Number(b.sortOrder || b.metadata?.sortOrder || 999);
        }
        return String(a.title || "").localeCompare(String(b.title || ""));
      });
  }, [products]);

  const categoryOptions = useMemo(() => {
    const labels = new Map([
      ["ration", "Ration baskets"],
      ["groceries", "Groceries"],
      ["flowers", "Flowers"],
      ["pet_services", "Pet services"]
    ]);
    return [...new Set(listedProducts.map(getPlanCategory))]
      .filter(Boolean)
      .map((value) => ({ value, label: labels.get(value) || value.replace("_", " ") }));
  }, [listedProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return listedProducts.filter((product) => {
      const category = getPlanCategory(product);
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const text = [
        product.title,
        product.description,
        product.metadata?.badge,
        ...getRationItems(product).map((item) => item.title || item.name || item.key)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || text.includes(query));
    });
  }, [activeCategory, listedProducts, searchQuery]);

  const rationProducts = useMemo(
    () => filteredProducts.filter((product) => getPlanCategory(product) === "ration"),
    [filteredProducts]
  );

  const regularProducts = useMemo(
    () => filteredProducts.filter((product) => getPlanCategory(product) !== "ration"),
    [filteredProducts]
  );

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
          },
          subscriptionCandidate: {
            productId: activeProduct.id,
            title: activeProduct.title || "Product",
            category: normalizeSubscriptionCategory(activeProduct.category?.name || activeProduct.category || ""),
            basePrice: Number(activeProduct.price || 0),
            quantity: 1,
            unit: activeProduct.unit || ""
          },
          subscriptionCandidates: [
            {
              productId: activeProduct.id,
              title: activeProduct.title || "Product",
              category: normalizeSubscriptionCategory(activeProduct.category?.name || activeProduct.category || ""),
              basePrice: Number(activeProduct.price || 0),
              quantity: 1,
              unit: activeProduct.unit || ""
            }
          ],
          cartItems: items.map((item, index) => ({
            id: item.productId || `subscription-item-${index}`,
            title: item.title,
            price: Number(item.unitPrice || 0),
            quantity: Number(item.quantity || 1),
            unit: item.unit || ""
          }))
        }
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to start subscription payment";
      // If backend is unreachable or timed out, save a pending draft and add to local bag so user sees it live
      if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('unable to connect') || msg.toLowerCase().includes('network')) {
        try {
          const localDraft = {
            id: `local-${Date.now()}`,
            productId: activeProduct?.id,
            category: normalizeSubscriptionCategory(activeProduct?.category?.name || activeProduct?.category || ""),
            pricing: pricing || {},
            items: items || [],
            savedAt: new Date().toISOString()
          };
          savePendingSubscriptionDraft(localDraft);
          // add a visible cart item for the subscription
          try {
            addItem({ id: localDraft.id, title: (activeProduct?.title || activeProduct?.name || 'Subscription'), price: Number((pricing?.totalPayable || pricing?.total || 0)), qty: 1 });
          } catch (e) {
            // ignore add-to-bag errors
          }
          navigate('/bag');
          return;
        } catch (e) {
          // fallback to alert
        }
      }

      alert(msg);
    }
  };

  return (
    <CategoryLayout title="Subscriptions" category="subscriptions">
      <div style={{ padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 10, color: "#C8102E" }}>Subscriptions</h1>
        <p style={{ marginBottom: 10, color: "#555" }}>
          Pick a basket or service first, review a short guided setup, then continue to payment.
        </p>
        <p style={{ marginBottom: 24, color: "#7a2034", fontWeight: 700 }}>
          Subscription activates only after payment is verified and approved.
        </p>

        <div
          style={{
            background: "#fff",
            border: "1px solid #f2d060",
            borderRadius: 14,
            padding: 14,
            marginBottom: 18,
            display: "grid",
            gap: 12
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center" }}>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by item, basket, flower, grocery..."
              style={{
                minHeight: 44,
                border: "1px solid #e7c86f",
                borderRadius: 10,
                padding: "0 14px",
                fontSize: 15
              }}
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              style={{
                minHeight: 44,
                border: "1px solid #e7c86f",
                borderRadius: 10,
                background: "#fff9c4",
                color: "#5A3A00",
                fontWeight: 800,
                padding: "0 14px",
                cursor: "pointer"
              }}
            >
              Reset
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ value: "all", label: "All plans" }, ...categoryOptions].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveCategory(item.value)}
                style={{
                  border: "1px solid #f2d060",
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: activeCategory === item.value ? "#C8102E" : "#fffdf4",
                  color: activeCategory === item.value ? "#fff" : "#6b4b00",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <div>Loading subscription products...</div>}
        {error && <div style={{ color: "#C8102E", marginBottom: 12 }}>{error}</div>}

        {!loading && !error && filteredProducts.length === 0 && (
          <div style={{ color: "#777" }}>No matching subscription plans found.</div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div style={{ display: "grid", gap: 24 }}>
            {rationProducts.length > 0 && (
              <section
                style={{
                  background: "linear-gradient(135deg, #fff5cf 0%, #ffe58f 100%)",
                  border: "1px solid #f2d060",
                  borderRadius: 18,
                  padding: 18
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                  <div>
                    <div style={{ color: "#8b5e00", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.7 }}>
                      Highlighted Category
                    </div>
                    <div style={{ color: "#C8102E", fontSize: 28, fontWeight: 900, marginTop: 4 }}>Ration Plans</div>
                    <div style={{ color: "#6b4b00", marginTop: 6, maxWidth: 720 }}>
                      A shorter, clearer way to subscribe: choose one ready monthly basket instead of building a long custom slab.
                    </div>
                  </div>
                  <div style={{ alignSelf: "center", color: "#7a2034", fontWeight: 800 }}>
                    {rationProducts.length} curated basket{rationProducts.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {rationProducts.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        background: "#fffdf4",
                        borderRadius: 16,
                        padding: 16,
                        border: "1px solid #f0d995",
                        display: "grid",
                        gridTemplateColumns: "minmax(220px, 1.2fr) minmax(220px, 0.9fr) auto",
                        gap: 14,
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, color: "#5A3A00", fontSize: 22 }}>{product.title}</div>
                        <div style={{ color: "#8b5e00", fontSize: 13, marginTop: 4 }}>
                          {product.metadata?.badge || "Monthly ration"} {product.metadata?.itemCount ? `| ${product.metadata.itemCount} items` : ""}
                        </div>
                        <div style={{ color: "#666", fontSize: 14, marginTop: 8 }}>
                          {product.description}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                          {getRationItems(product).slice(0, 5).map((item) => (
                            <span
                              key={item.key || item.title}
                              style={{
                                background: "#fff",
                                border: "1px solid #f2d060",
                                borderRadius: 999,
                                color: "#5A3A00",
                                fontSize: 12,
                                fontWeight: 800,
                                padding: "6px 10px"
                              }}
                            >
                              {item.title || item.name} {item.quantity ? `x ${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: "#C8102E", fontWeight: 900, fontSize: 24 }}>
                          Rs {Number(product.price || 0).toFixed(2)}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13, color: "#8b5e00" }}>
                          Choose a duration, preview what is included, and continue in one simple flow.
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveProduct(product)}
                        style={{
                          background: "linear-gradient(135deg, #C8102E 0%, #9f1239 100%)",
                          color: "#fff",
                          border: "none",
                          padding: "12px 16px",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontWeight: 800,
                          minWidth: 190
                        }}
                      >
                        Choose Ration Plan
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {regularProducts.length > 0 && (
              <section>
                <div style={{ color: "#C8102E", fontWeight: 900, fontSize: 22, marginBottom: 12 }}>
                  More Subscription Options
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {regularProducts.map((product) => (
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
              </section>
            )}
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
