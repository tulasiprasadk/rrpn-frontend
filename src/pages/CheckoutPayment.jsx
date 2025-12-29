import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Payment.css";

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const location = useLocation();

  // get order amount passed from previous step
  const amount = location.state?.amount || 0;
  const orderId = location.state?.orderId;

  const [unr, setUnr] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // HANDLE SCREENSHOT UPLOAD
  const handleImage = (e) => {
    const img = e.target.files[0];
    if (!img) return;

    // preview
    setPreview(URL.createObjectURL(img));
    setFile(img);
  };

  // SUBMIT PAYMENT
  const handleSubmit = async () => {
    if (!unr || unr.length < 6) {
      alert("Please enter a valid UNR number (min 6 chars).");
      return;
    }

    if (!file) {
      alert("Please upload your payment screenshot.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("paymentScreenshot", file);
    formData.append("unr", unr);
    if (orderId) formData.append("orderId", String(orderId));

    try {
      const res = await axios.post(
        "/api/orders/submit-payment",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Redirect to success screen
      navigate("/payment/submitted", {
        state: {
          unr,
          screenshot: preview,
          amount,
        },
      });

    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting payment.");
    }

    setLoading(false);
  };

  return (
    <div className="payment-page" style={{ background: '#FFFDE7', minHeight: '100vh', borderRadius: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ background: '#FFF9C4', padding: '12px 0', borderRadius: '10px', textAlign: 'center', marginBottom: 18 }}>Complete Your Payment</h2>
      {/* PAYMENT INSTRUCTIONS */}
      <div className="payment-instructions" style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <h3 style={{ marginBottom: 10 }}>Step 1: Make Payment</h3>
        <p>Use the UPI ID below or scan the QR:</p>
        <div className="upi-box" style={{ background: '#FFFDE7', padding: '8px 12px', borderRadius: 8, marginBottom: 10 }}>
          <strong>UPI ID:</strong> rrnagar@upi
        </div>
        <img src="/qr.png" alt="QR Code" className="qr-img" style={{ width: 160, height: 160, borderRadius: 8, border: '1.5px solid #007bff', marginBottom: 10 }} />
        <p className="note">
          After payment, upload the screenshot and enter the UNR number.
        </p>
      </div>
      {/* UNR INPUT */}
      <div className="unr-box" style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <label>Enter UNR Number*</label>
        <input
          type="text"
          placeholder="Enter UNR number"
          value={unr}
          onChange={(e) => setUnr(e.target.value)}
          style={{ padding: '12px', width: '100%', border: '2px solid #ddd', borderRadius: '6px', fontSize: '16px', marginBottom: '15px' }}
        />
      </div>
      {/* SCREENSHOT UPLOAD */}
      <div className="screenshot-box" style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <label>Upload Screenshot*</label>
        {preview ? (
          <div className="preview-block">
            <img src={preview} className="preview-img" style={{ width: 160, height: 160, borderRadius: 8, border: '1.5px solid #007bff', marginBottom: 10 }} />
            <button
              type="button"
              className="upload-again"
              onClick={() => {
                setPreview(null);
                setFile(null);
              }}
              style={{ marginTop: 10, padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              Upload Again
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ padding: '10px', border: '2px dashed #ddd', borderRadius: '8px', width: '100%', marginBottom: '15px', cursor: 'pointer' }}
          />
        )}
      </div>
      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="submit-payment-btn"
        style={{ padding: '14px 28px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', width: '100%' }}
      >
        {loading ? "Submitting..." : "Submit Payment"}
      </button>
    </div>
  );
}
