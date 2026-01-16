import { useState } from "react";
import api from "../api/client";
import imageCompression from "browser-image-compression";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentPage.mobile.css";

export default function PaymentPage() {
  const [method, setMethod] = useState("upi");
  const { state } = useLocation();
  const navigate = useNavigate();

  const orderId = state?.orderId;
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState(null);

  // ------------------------------
  // Compress Image Before Upload
  // ------------------------------
  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 0.4,        // 400 KB max (you can adjust)
      maxWidthOrHeight: 1280, // Resize to reasonable resolution
      useWebWorker: true
    };

    try {
      const compressed = await imageCompression(imageFile, options);
      console.log(
        "Original Size:",
        (imageFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );
      console.log(
        "Compressed Size:",
        (compressed.size / 1024 / 1024).toFixed(2),
        "MB"
      );
      return compressed;
    } catch (err) {
      console.error("Compression failed:", err);
      return imageFile; // fallback if compression fails
    }
  };


  // ------------------------------
  // Submit Payment (Screenshot or UNR)
  // ------------------------------
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
      // Compress image before upload
      const compressed = await compressImage(file);
      form.append("paymentScreenshot", compressed);
    }
    if (txnId) {
      form.append("unr", txnId);
    }

    try {
      await api.post("/orders/submit-payment", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/payment-success", {
        state: {
          orderId: orderId,
          txnId: txnId,
          screenshot: file ? URL.createObjectURL(file) : "",
          paymentMethod: method
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
        padding: '40px 20px',
        maxWidth: '700px',
        margin: '0 auto',
        background: '#FFFDE7',
        minHeight: '80vh',
        borderRadius: '18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)'
      }}
    >

      <h2
        className="payment-page-title"
        style={{
          color: '#333',
          marginBottom: '18px',
          fontSize: '28px',
          background: '#FFF9C4',
          padding: '12px 0',
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
        }}
      >
        Complete Your Payment
      </h2>

      <div className="payment-methods" style={{ marginBottom: 24, background: '#FFF9C4', padding: '12px', borderRadius: '10px' }}>
        <label className="payment-method-label" style={{ fontWeight: 600, fontSize: 17, marginRight: 18 }}>
          <input type="radio" value="upi" checked={method === "upi"} onChange={() => setMethod("upi")} /> UPI
        </label>
        <label className="payment-method-label" style={{ fontWeight: 600, fontSize: 17 }}>
          <input type="radio" value="pi" checked={method === "pi"} onChange={() => setMethod("pi")} /> Pi Network
        </label>
      </div>

      {method === "upi" && (
        <div className="payment-card" style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Pay via UPI</h3>
          <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <img src="/UPI QR Code.jpeg" alt="UPI QR Code" style={{ width: 200, height: 200, borderRadius: 8, border: '1.5px solid #007bff', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 14, color: '#555', textAlign: 'center' }}>
            Scan the QR code above to make payment. Then upload your payment screenshot and enter the UPI transaction ID below.
          </div>
        </div>
      )}
      {method === "pi" && (
        <div className="payment-card" style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Pay via Pi Network</h3>
          <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <img src="/Pi network QR code.jpg" alt="Pi Network QR Code" style={{ width: 200, height: 200, borderRadius: 8, border: '1.5px solid #007bff', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 14, color: '#555', textAlign: 'center' }}>Scan the QR code above with Pi Network app to make payment. Then upload your payment screenshot and enter the Pi transaction ID below.</div>
        </div>
      )}

      <div
        className="payment-card"
        style={{
          background: '#FFF9C4',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
        }}
      >
        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Step 1: Upload Payment Screenshot</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="payment-file-input"
          style={{
            padding: '10px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            width: '100%',
            marginBottom: '15px',
            cursor: 'pointer'
          }}
        />


      </div>

      <div
        className="payment-card"
        style={{
          background: '#FFF9C4',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
        }}
      >
        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Step 2: Enter Transaction ID</h3>
        <input
          type="text"
          placeholder={method === 'upi' ? 'Enter UPI Transaction ID' : 'Enter Pi Transaction ID'}
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          className="payment-text-input"
          style={{ 
            padding: '12px', 
            width: '100%',
            border: '2px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px',
            marginBottom: '15px'
          }}
        />
        <button
          className="payment-submit-btn"
          onClick={submitPayment}
          style={{
            padding: '14px 28px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          ✅ Submit Payment
        </button>
      </div>

      <div style={{ 
        marginTop: '25px', 
        padding: '15px', 
        background: '#FFF9C4',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
      }}>
        <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
          💡 <strong>Tip:</strong> Make sure your UNR number is correct. You will receive confirmation once payment is verified.
        </p>
      </div>
    </div>
  );
}



