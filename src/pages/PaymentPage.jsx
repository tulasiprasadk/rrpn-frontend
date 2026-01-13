import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import imageCompression from "browser-image-compression";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const [method, setMethod] = useState("upi");
  const { state } = useLocation();
  const navigate = useNavigate();

  const orderId = state?.orderId;
  
  // Get Pi wallet address from environment variable (Vite format)
  // Use try-catch to prevent errors if env var access fails
  let piWalletAddress = 'SBN2G6MNXED5ORVI6WA7O4CAIJ4SX3X4L5EQJYICPPVNM773TRBUNVY2';
  try {
    piWalletAddress = import.meta.env.VITE_PI_WALLET || 'SBN2G6MNXED5ORVI6WA7O4CAIJ4SX3X4L5EQJYICPPVNM773TRBUNVY2';
  } catch (err) {
    console.warn('Could not read VITE_PI_WALLET:', err);
  }
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [upiUrl, setUpiUrl] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentRef, setPaymentRef] = useState("");
  const [loadingQR, setLoadingQR] = useState(true);
  const [error, setError] = useState("");

  // Load QR code when component mounts or orderId changes
  useEffect(() => {
    if (orderId) {
      loadQRCode();
    } else {
      setError("Order ID is required");
      setLoadingQR(false);
    }
  }, [orderId]);

  const loadQRCode = async () => {
    try {
      setLoadingQR(true);
      setError("");

      // First, try to get existing payment
      try {
        const paymentRes = await axios.get(`${API_BASE}/payments/order/${orderId}`, {
          withCredentials: true // Include cookies for session (works for both logged-in and guest)
        });
        if (paymentRes.data.success && paymentRes.data.payment) {
          const payment = paymentRes.data.payment;
          setQrCode(payment.qrCode || payment.upiQrCode || null);
          setUpiId(payment.metadata?.upiId || payment.upiId || "");
          setUpiUrl(payment.metadata?.upiUrl || payment.upiUrl || "");
          setAmount(payment.amount || 0);
          setPaymentRef(payment.metadata?.paymentRef || "");
          setLoadingQR(false);
          return;
        }
      } catch (err) {
        console.log("No existing payment, creating new one...", err.response?.data || err.message);
      }

      // Create new payment to generate QR code
      // Get order amount from state or use default
      const orderAmount = state?.orderDetails?.totalAmount || state?.amount || state?.orderDetails?.amount || 0;

      const createRes = await axios.post(`${API_BASE}/payments/create`, {
        orderId: orderId,
        amount: orderAmount,
        distance: state?.distance || 0,
        weight: state?.weight || 0,
        zone: state?.zone || null
      }, {
        withCredentials: true // Include cookies for session (works for both logged-in and guest)
      });

      if (createRes.data.success && createRes.data.payment) {
        const payment = createRes.data.payment;
        setQrCode(payment.qrCode || null);
        setUpiId(payment.upiId || "");
        setUpiUrl(payment.upiUrl || "");
        setAmount(payment.amount || orderAmount);
        setPaymentRef(payment.paymentRef || "");
      } else {
        setError("Failed to generate payment QR code");
      }
    } catch (err) {
      console.error("Error loading QR code:", err);
      setError(err.response?.data?.error || "Failed to load payment QR code. Please try again.");
    } finally {
      setLoadingQR(false);
    }
  };

  // Compress Image Before Upload
  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true
    };

    try {
      const compressed = await imageCompression(imageFile, options);
      console.log("Original Size:", (imageFile.size / 1024 / 1024).toFixed(2), "MB");
      console.log("Compressed Size:", (compressed.size / 1024 / 1024).toFixed(2), "MB");
      return compressed;
    } catch (err) {
      console.error("Compression failed:", err);
      return imageFile;
    }
  };

  // Submit Payment
  const submitPayment = async () => {
    if (!file && !txnId) {
      alert("Please provide either a payment screenshot or a transaction ID.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("orderId", orderId);
    if (file) {
      const compressed = await compressImage(file);
      form.append("paymentScreenshot", compressed);
    }
    if (txnId) {
      form.append("unr", txnId);
    }

    try {
      const response = await axios.post(`${API_BASE}/orders/submit-payment`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true // Include cookies for session (works for both logged-in and guest)
      });
      
      if (response.data.success || response.status === 200) {
        navigate("/payment-success", {
          state: {
            orderId: orderId,
            txnId: txnId,
            screenshot: file ? URL.createObjectURL(file) : "",
            paymentMethod: method
          }
        });
      } else {
        alert(response.data?.msg || "Payment submitted, but no confirmation received. Please contact support.");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      const errorMsg = error?.response?.data?.msg || error?.response?.data?.error || error?.message || "Failed to submit payment. Please try again.";
      
      // Handle specific error cases
      if (error?.response?.status === 401) {
        // This shouldn't happen now, but just in case
        alert("Authentication error. Please try again or contact support.");
      } else if (error?.response?.status === 404) {
        alert("Order not found. Please go back to checkout and try again.");
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyUPIId = () => {
    if (upiId) {
      navigator.clipboard.writeText(upiId);
      alert("UPI ID copied to clipboard!");
    }
  };

  const openUPIApp = () => {
    if (upiUrl) {
      window.location.href = upiUrl;
    } else {
      alert("UPI payment link not available");
    }
  };

  // Error boundary: if orderId is missing, show error instead of blank page
  if (!orderId) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        maxWidth: '700px', 
        margin: '0 auto',
        background: '#FFFDE7',
        minHeight: '80vh',
        borderRadius: '18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{ color: '#c33', marginBottom: '20px' }}>⚠️ Order ID Missing</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Please go back to checkout and try again.
        </p>
        <button 
          onClick={() => navigate('/cart')}
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Cart
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '700px', 
      margin: '0 auto',
      background: '#FFFDE7',
      minHeight: '80vh',
      borderRadius: '18px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)'
    }}>
      <h2 style={{ 
        color: '#333', 
        marginBottom: '18px',
        fontSize: '28px',
        background: '#FFF9C4',
        padding: '12px 0',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
      }}>
        Complete Your Payment
      </h2>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
          <button 
            onClick={loadQRCode}
            style={{
              marginLeft: '12px',
              padding: '6px 12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {amount > 0 && (
        <div style={{
          background: '#FFF9C4',
          padding: '16px',
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#333' }}>
            Amount to Pay: ₹{amount.toFixed(2)}
          </h3>
          {paymentRef && (
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
              Payment Ref: <strong>{paymentRef}</strong>
            </p>
          )}
        </div>
      )}

      <div style={{ marginBottom: 24, background: '#FFF9C4', padding: '12px', borderRadius: '10px' }}>
        <label style={{ fontWeight: 600, fontSize: 17, marginRight: 18 }}>
          <input type="radio" value="upi" checked={method === "upi"} onChange={() => setMethod("upi")}/> UPI
        </label>
        <label style={{ fontWeight: 600, fontSize: 17 }}>
          <input type="radio" value="pi" checked={method === "pi"} onChange={() => setMethod("pi")}/> Pi Network
        </label>
      </div>

      {method === "upi" && (
        <div style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 18, textAlign: 'center' }}>Pay via UPI</h3>
          
          {/* Always show UPI QR code from static image */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img 
              src="/UPI QR Code.jpeg" 
              alt="UPI QR Code" 
              style={{ 
                width: 250, 
                height: 250, 
                borderRadius: 8, 
                border: '2px solid #007bff',
                background: 'white',
                padding: '8px',
                objectFit: 'contain'
              }} 
              onError={(e) => {
                console.error('Failed to load UPI QR code image');
                // Try fallback
                e.target.src = '/upi-qr-code.png';
                e.target.onError = () => {
                  const container = e.target.parentElement;
                  if (container) {
                    container.innerHTML = '<div style="padding: 40px; background: #fff3cd; border-radius: 8px; color: #856404; border: 2px dashed #ffc107;"><p style="margin: 0 0 8px 0; font-weight: 600;">QR Code Image Not Found</p><p style="margin: 0; font-size: 12px;">Please save your UPI QR code as <code>UPI QR Code.jpeg</code> or <code>upi-qr-code.png</code> in the <code>public</code> folder.</p></div>';
                  }
                };
              }}
            />
          </div>

          {upiId && (
            <div style={{ 
              background: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: '4px' }}>UPI ID:</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{upiId}</div>
              </div>
              <button 
                onClick={copyUPIId}
                style={{ 
                  padding: '8px 16px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Copy
              </button>
            </div>
          )}

          {upiUrl && (
            <button
              onClick={openUPIApp}
              style={{
                width: '100%',
                padding: '12px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px'
              }}
            >
              📱 Open UPI App
            </button>
          )}

          <div style={{ fontSize: 14, color: '#555', textAlign: 'center' }}>
            Scan the QR code or pay to the UPI ID above. Then upload your payment screenshot and enter the UPI transaction ID below.
          </div>
        </div>
      )}

      {method === "pi" && (
        <div style={{ 
          background: '#FFF9C4', 
          padding: 24, 
          borderRadius: 10, 
          marginBottom: 24, 
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          minHeight: '200px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 20, textAlign: 'center', color: '#333' }}>
            💰 Pay via Pi Network
          </h3>
          
          {amount > 0 && (
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              textAlign: 'center',
              border: '2px solid #FFC107'
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                Amount: {amount.toFixed(2)} Pi
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                (Approximate conversion: ₹{amount.toFixed(2)})
              </div>
            </div>
          )}
          
          {/* Pi Network QR Code */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img 
              src="/Pi network QR code.jpg" 
              alt="Pi Network QR Code" 
              style={{ 
                width: 250, 
                height: 250, 
                borderRadius: 8, 
                border: '2px solid #FF6B35',
                background: 'white',
                padding: '8px',
                objectFit: 'contain'
              }} 
              onError={(e) => {
                console.error('Failed to load Pi Network QR code image');
                // Try fallback
                e.target.src = '/pi-network-qr-code.png';
                e.target.onError = () => {
                  const container = e.target.parentElement;
                  if (container) {
                    container.innerHTML = '<div style="padding: 40px; background: #fff3cd; border-radius: 8px; color: #856404; border: 2px dashed #ffc107;"><p style="margin: 0 0 8px 0; font-weight: 600;">QR Code Image Not Found</p><p style="margin: 0; font-size: 12px;">Please save your Pi Network QR code as <code>Pi network QR code.jpg</code> or <code>pi-network-qr-code.png</code> in the <code>public</code> folder.</p></div>';
                  }
                };
              }}
            />
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: 16, fontWeight: '600', marginBottom: '12px', color: '#333' }}>
              📱 Pi Network Wallet Address:
            </div>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#1976D2',
              padding: '12px',
              background: '#E3F2FD',
              borderRadius: '6px',
              wordBreak: 'break-all',
              marginBottom: '12px'
            }}>
              {piWalletAddress}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(piWalletAddress);
                alert('Pi Wallet address copied to clipboard!');
              }}
              style={{
                padding: '8px 16px',
                background: '#1976D2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📋 Copy Wallet Address
            </button>
          </div>
          
          <div style={{ 
            background: '#E8F5E9', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #4CAF50'
          }}>
            <div style={{ fontSize: 15, fontWeight: '600', marginBottom: '8px', color: '#2E7D32' }}>
              📝 Instructions:
            </div>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: 14, color: '#555', lineHeight: '1.8' }}>
              <li>Open the Pi Network app on your mobile device</li>
              <li>Scan the QR code above or navigate to the "Send" or "Transfer" section</li>
              <li>If scanning QR code, confirm the wallet address and amount</li>
              <li>If entering manually, enter the wallet address shown above</li>
              <li>Enter the amount: <strong>{amount > 0 ? amount.toFixed(2) : 'your order amount'}</strong> Pi</li>
              <li>Complete the transaction in the Pi Network app</li>
              <li>Take a screenshot of the transaction confirmation</li>
              <li>Upload the screenshot and enter the transaction ID below</li>
            </ol>
          </div>
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#FFF3CD', 
            borderRadius: '8px',
            border: '1px solid #FFC107'
          }}>
            <div style={{ fontSize: 13, color: '#856404', margin: 0 }}>
              ⚠️ <strong>Note:</strong> Make sure you have sufficient Pi balance in your wallet before proceeding. 
              The transaction will be verified by our team before order confirmation.
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        background: '#FFF9C4', 
        padding: '25px', 
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Step 1: Upload Payment Screenshot</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            padding: '10px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            width: '100%',
            marginBottom: '15px',
            cursor: 'pointer'
          }}
        />

        {file && (
          <div style={{ marginBottom: '12px' }}>
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '8px',
                border: '1px solid #ddd'
              }} 
            />
          </div>
        )}
      </div>

      <div style={{ 
        background: '#FFF9C4', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Step 2: Enter Transaction ID</h3>
        <input
          type="text"
          placeholder={method === 'upi' ? 'Enter UPI Transaction ID' : 'Enter Pi Transaction ID'}
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
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
          onClick={submitPayment}
          disabled={loading || (!file && !txnId)}
          style={{ 
            padding: '14px 28px',
            background: loading || (!file && !txnId) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || (!file && !txnId) ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {loading ? "Submitting..." : "✅ Submit Payment"}
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
          💡 <strong>Tip:</strong> Make sure your transaction ID is correct. You will receive confirmation once payment is verified.
        </p>
      </div>
    </div>
  );
}
