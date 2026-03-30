import { useState } from "react";
import api from "../api/client";
import imageCompression from "browser-image-compression";
import { useLocation, useNavigate } from "react-router-dom";
import { savePendingSubscriptionCandidate } from "../components/SubscriptionPrompt";
import "./PaymentPage.mobile.css";

const PAYMENT_SUBSCRIPTION_PLANS = [
  { period: "monthly", label: "Monthly", discountPercent: 5, months: 1, badge: "Easy Start" },
  { period: "quarterly", label: "3 Months", discountPercent: 7, months: 3, badge: "Most Popular" },
  { period: "half_yearly", label: "6 Months", discountPercent: 9, months: 6, badge: "Better Savings" },
  { period: "yearly", label: "Yearly", discountPercent: 12, months: 12, badge: "Best Value" }
];

function buildPaymentPlans(basePrice) {
  const normalizedPrice = Number(basePrice || 0);
  if (normalizedPrice <= 0) return [];

  return PAYMENT_SUBSCRIPTION_PLANS.map((plan) => {
    const baseCyclePrice = normalizedPrice * plan.months;
    const discountedPrice = Number((baseCyclePrice * (1 - plan.discountPercent / 100)).toFixed(2));
    return {
      ...plan,
      discountedPrice,
      savings: Number((baseCyclePrice - discountedPrice).toFixed(2))
    };
  });
}

export default function PaymentPage() {
  const [method, setMethod] = useState("upi");
  const { state } = useLocation();
  const navigate = useNavigate();

  const orderId = state?.orderId;
  const subscriptionCandidate = state?.subscriptionCandidate || null;
  const subscriptionPlans = buildPaymentPlans(subscriptionCandidate?.basePrice);
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState(null);
  const [selectedSubscriptionPeriod, setSelectedSubscriptionPeriod] = useState("");

  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true
    };

    try {
      return await imageCompression(imageFile, options);
    } catch (err) {
      console.error("Compression failed:", err);
      return imageFile;
    }
  };

  const submitPayment = async () => {
    if (!orderId) {
      alert("Missing order details. Please return to checkout and try again.");
      navigate("/checkout");
      return;
    }
    if (!file && !txnId) {
      alert("Please provide either a payment screenshot or a transaction ID.");
      return;
    }

    const form = new FormData();
    form.append("orderId", orderId);
    if (file) {
      const compressed = await compressImage(file);
      form.append("paymentScreenshot", compressed);
    }
    if (txnId) {
      form.append("unr", txnId);
    }
    if (selectedSubscriptionPeriod && subscriptionCandidate?.basePrice > 0) {
      form.append("subscriptionPeriod", selectedSubscriptionPeriod);
      form.append("subscriptionBasePrice", String(Number(subscriptionCandidate.basePrice || 0)));
    }

    try {
      await api.post("/orders/submit-payment", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!selectedSubscriptionPeriod && subscriptionCandidate?.productId) {
        savePendingSubscriptionCandidate(subscriptionCandidate);
      }

      navigate("/payment-success", {
        state: {
          orderId,
          txnId,
          screenshot: file ? URL.createObjectURL(file) : "",
          paymentMethod: method,
          subscriptionCandidate,
          selectedSubscriptionPeriod,
        }
      });
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert(
        error?.response?.data?.error ||
        error?.response?.data?.msg ||
        error?.message ||
        "Failed to submit payment. Please try again."
      );
    }
  };

  if (!orderId) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Payment</h2>
        <p style={{ color: "#b00018" }}>Missing order details. Please go back to checkout.</p>
        <button
          onClick={() => navigate("/checkout")}
          style={{ padding: "10px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: 6 }}
        >
          Back to Checkout
        </button>
      </div>
    );
  }

  return (
    <div
      className="payment-page-root"
      style={{
        padding: "40px 20px",
        maxWidth: "760px",
        margin: "0 auto",
        background: "#FFFDE7",
        minHeight: "80vh",
        borderRadius: "18px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)"
      }}
    >
      <h2
        className="payment-page-title"
        style={{
          color: "#333",
          marginBottom: "18px",
          fontSize: "28px",
          background: "#FFF9C4",
          padding: "12px 0",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}
      >
        Complete Your Payment
      </h2>

      <div className="payment-methods" style={{ marginBottom: 24, background: "#FFF9C4", padding: "12px", borderRadius: "10px" }}>
        <label className="payment-method-label" style={{ fontWeight: 600, fontSize: 17, marginRight: 18 }}>
          <input type="radio" value="upi" checked={method === "upi"} onChange={() => setMethod("upi")} /> UPI
        </label>
        <label className="payment-method-label" style={{ fontWeight: 600, fontSize: 17 }}>
          <input type="radio" value="pi" checked={method === "pi"} onChange={() => setMethod("pi")} /> Pi Network
        </label>
      </div>

      {method === "upi" && (
        <div className="payment-card" style={{ background: "#FFF9C4", padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Pay via UPI</h3>
          <div style={{ margin: "12px 0", display: "flex", justifyContent: "center" }}>
            <img src="/UPI QR Code.jpeg" alt="UPI QR Code" style={{ width: 200, height: 200, borderRadius: 8, border: "1.5px solid #007bff", objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: 14, color: "#555", textAlign: "center" }}>
            Scan the QR code above to make payment. Then upload your payment screenshot and enter the UPI transaction ID below.
          </div>
        </div>
      )}

      {method === "pi" && (
        <div className="payment-card" style={{ background: "#FFF9C4", padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Pay via Pi Network</h3>
          <div style={{ margin: "12px 0", display: "flex", justifyContent: "center" }}>
            <img src="/Pi network QR code.jpg" alt="Pi Network QR Code" style={{ width: 200, height: 200, borderRadius: 8, border: "1.5px solid #007bff", objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: 14, color: "#555", textAlign: "center" }}>
            Scan the QR code above with Pi Network app to make payment. Then upload your payment screenshot and enter the Pi transaction ID below.
          </div>
        </div>
      )}

      {subscriptionPlans.length > 0 && (
        <div
          className="payment-card"
          style={{
            background: "linear-gradient(135deg, #fff8cc 0%, #ffe78a 52%, #ffd55c 100%)",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow: "0 10px 28px rgba(194, 120, 0, 0.12)",
            border: "1px solid rgba(210, 140, 0, 0.2)"
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: "#9a3412" }}>
            Add With This Payment
          </div>
          <h3 style={{ margin: "8px 0 6px", fontSize: "28px", lineHeight: 1.05, color: "#5A3A00" }}>
            Subscribe and Forget
          </h3>
          <p style={{ margin: 0, color: "#6b3f00", lineHeight: 1.6 }}>
            Lock this into your payment now. We will remind you before every cycle and deliver on schedule, so you never have to reorder {subscriptionCandidate?.title || "this product"} manually again.
          </p>

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {subscriptionPlans.map((plan) => {
              const selected = selectedSubscriptionPeriod === plan.period;
              return (
                <label
                  key={plan.period}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                    padding: "14px 16px",
                    borderRadius: 14,
                    cursor: "pointer",
                    background: selected ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.78)",
                    border: selected ? "2px solid #C8102E" : "1px solid rgba(210, 140, 0, 0.16)"
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: "1 1 320px" }}>
                    <input
                      type="radio"
                      name="subscriptionPlan"
                      checked={selected}
                      onChange={() => setSelectedSubscriptionPeriod(plan.period)}
                      style={{ marginTop: 6 }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#5A3A00" }}>
                          {plan.label} plan
                        </div>
                        <div style={{ padding: "4px 10px", borderRadius: 999, background: "#fff1f2", color: "#be123c", fontWeight: 800, fontSize: 12 }}>
                          Save {plan.discountPercent}%
                        </div>
                        <div style={{ padding: "4px 10px", borderRadius: 999, background: "#ecfccb", color: "#3f6212", fontWeight: 800, fontSize: 12 }}>
                          {plan.badge}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 14, color: "#6b3f00" }}>
                        Pay Rs {plan.discountedPrice.toFixed(2)} now for {plan.months} month{plan.months > 1 ? "s" : ""} and save Rs {plan.savings.toFixed(2)}.
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, color: "#8b5e00" }}>
                        One payment decision now. Recurring delivery stays handled.
                      </div>
                    </div>
                  </div>
                  {selected && (
                    <div style={{ fontWeight: 800, color: "#C8102E" }}>
                      Included with payment
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {[
              "We remind before dispatch",
              "No need to reorder manually",
              "Recurring delivery on schedule"
            ].map((point) => (
              <div
                key={point}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#6b3f00"
                }}
              >
                {point}
              </div>
            ))}
          </div>

          {selectedSubscriptionPeriod && (
            <button
              type="button"
              onClick={() => setSelectedSubscriptionPeriod("")}
              style={{
                marginTop: 14,
                border: "none",
                background: "transparent",
                color: "#9a3412",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0
              }}
            >
              Remove subscription from this payment
            </button>
          )}
        </div>
      )}

      <div
        className="payment-card"
        style={{
          background: "#FFF9C4",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "25px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}
      >
        <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Step 1: Upload Payment Screenshot</h3>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="payment-file-input"
          style={{
            padding: "10px",
            border: "2px dashed #ddd",
            borderRadius: "8px",
            width: "100%",
            marginBottom: "15px",
            cursor: "pointer"
          }}
        />
      </div>

      <div
        className="payment-card"
        style={{
          background: "#FFF9C4",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}
      >
        <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Step 2: Enter Transaction ID</h3>
        <input
          type="text"
          placeholder={method === "upi" ? "Enter UPI Transaction ID" : "Enter Pi Transaction ID"}
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          className="payment-text-input"
          style={{
            padding: "12px",
            width: "100%",
            border: "2px solid #ddd",
            borderRadius: "6px",
            fontSize: "16px",
            marginBottom: "15px"
          }}
        />
        <button
          className="payment-submit-btn"
          onClick={submitPayment}
          style={{
            padding: "14px 28px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            width: "100%"
          }}
        >
          Submit Payment
        </button>
      </div>

      <div
        style={{
          marginTop: "25px",
          padding: "15px",
          background: "#FFF9C4",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}
      >
        <p style={{ color: "#856404", margin: 0, fontSize: "14px" }}>
          <strong>Tip:</strong> Make sure your transaction ID is correct. You will receive confirmation once payment is verified{selectedSubscriptionPeriod ? ", and your subscription will activate with approval." : "."}
        </p>
      </div>
    </div>
  );
}
