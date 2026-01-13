import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";
import "./Payment.css";

export default function PaymentPageUPI() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, amount } = location.state || {};

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is required");
      setLoading(false);
      return;
    }

    loadPayment();
  }, [orderId]);

  async function loadPayment() {
    try {
      const res = await api.get(`/payments/order/${orderId}`);
      if (res.data.success && res.data.payment) {
        setPayment(res.data.payment);
      } else {
        // Create payment if it doesn't exist
        await createPayment();
      }
    } catch (err) {
      console.error("Error loading payment:", err);
      // Try to create payment
      await createPayment();
    } finally {
      setLoading(false);
    }
  }

  async function createPayment() {
    try {
      const res = await api.post("/payments/create", {
        orderId: orderId,
        amount: amount || 0
      });

      if (res.data.success) {
        setPayment({
          id: res.data.payment.id,
          qrCode: res.data.payment.qrCode,
          upiUrl: res.data.payment.upiUrl,
          upiId: res.data.payment.upiId,
          amount: res.data.payment.amount,
          paymentRef: res.data.payment.paymentRef
        });
      } else {
        setError("Failed to create payment");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      setError("Failed to create payment. Please try again.");
    }
  }

  async function handleVerifyPayment() {
    if (!transactionId.trim()) {
      alert("Please enter transaction ID");
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post("/payments/verify", {
        paymentId: payment.id,
        transactionId: transactionId.trim(),
        upiReference: upiReference.trim()
      });

      if (res.data.success) {
        alert("Payment verification submitted! Admin will verify manually.");
        navigate(`/order-success/${orderId}`);
      } else {
        alert(res.data.error || "Failed to verify payment");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      alert("Failed to verify payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  function handleOpenUPIApp() {
    if (payment?.upiUrl) {
      window.location.href = payment.upiUrl;
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading payment...</h2>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#c8102e" }}>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/bag")} style={{ marginTop: 20, padding: "10px 20px" }}>
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Payment</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>
          Order ID: <strong>{orderId}</strong>
        </p>

        <div className="payment-amount">
          <h2>₹{payment?.amount || amount || 0}</h2>
          <p>Payment Reference: {payment?.paymentRef || "N/A"}</p>
        </div>

        {/* UPI QR Code */}
        {payment?.qrCode && (
          <div className="upi-qr-section">
            <h3>Scan QR Code to Pay</h3>
            <div className="qr-code-container">
              <img src={payment.qrCode} alt="UPI QR Code" style={{ maxWidth: "300px", width: "100%" }} />
            </div>
            <p style={{ fontSize: "14px", color: "#666", marginTop: 10 }}>
              UPI ID: <strong>{payment.upiId}</strong>
            </p>
            <button
              onClick={handleOpenUPIApp}
              className="upi-app-button"
              style={{
                marginTop: 20,
                padding: "12px 24px",
                background: "#25D366",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 600
              }}
            >
              Open UPI App
            </button>
          </div>
        )}

        {/* Payment Verification Form */}
        <div className="payment-verification" style={{ marginTop: 40, padding: 20, background: "#f9f9f9", borderRadius: 12 }}>
          <h3>After Payment</h3>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: 20 }}>
            Enter your UPI transaction details to complete the order:
          </p>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
              Transaction ID / UPI Reference Number *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID from your UPI app"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
              UPI Reference (Optional)
            </label>
            <input
              type="text"
              value={upiReference}
              onChange={(e) => setUpiReference(e.target.value)}
              placeholder="Additional reference if available"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px"
              }}
            />
          </div>

          <button
            onClick={handleVerifyPayment}
            disabled={verifying || !transactionId.trim()}
            style={{
              width: "100%",
              padding: "14px",
              background: verifying ? "#ccc" : "#c8102e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: verifying ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: 600
            }}
          >
            {verifying ? "Verifying..." : "Submit Payment"}
          </button>
        </div>

        <div style={{ marginTop: 30, textAlign: "center" }}>
          <button
            onClick={() => navigate("/bag")}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
