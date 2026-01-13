import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { API_BASE } from "../config/api";
import "./CheckoutReview.css";

export default function CheckoutReview() {
  const location = useLocation();
  const navigate = useNavigate();

  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddressLine, setGuestAddressLine] = useState("");
  const [guestCity, setGuestCity] = useState("");
  const [guestState, setGuestState] = useState("");
  const [guestPincode, setGuestPincode] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedAddress = location.state?.selectedAddress || defaultAddress;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        
        // Load address
        try {
          const res = await api.get("/customer/address");
          const list = Array.isArray(res.data) ? res.data : [];
          const def = list.find((a) => a.isDefault) || list[0] || null;
          setDefaultAddress(def);
        } catch (addrErr) {
          console.error("Address loading error:", addrErr);
          if (addrErr.response?.status === 401) {
            // Not logged in — enable guest checkout inline and show guest form
            setIsGuest(true);
            setShowGuestForm(true);
            setDefaultAddress(null);
          } else if (addrErr.code === 'ERR_NETWORK') {
            setError("Cannot connect to server. Please check if the backend is running.");
          } else if (addrErr.response?.status === 404) {
            // No address found, but do not block checkout
            setDefaultAddress(null);
          } else {
            setError(`Failed to load address: ${addrErr.response?.data?.error || addrErr.message}`);
          }
        }

        // Load cart from localStorage (prefer `bag` produced by CrackerCartContext)
        const bag = JSON.parse(localStorage.getItem("bag") || "null");
        if (Array.isArray(bag) && bag.length) {
          setCart(bag.map(i => ({ ...i, quantity: i.quantity || i.qty || 1 })));
        } else {
          const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
          setCart(Array.isArray(cartData) ? cartData.map(i => ({ ...i, quantity: i.quantity || i.qty || 1 })) : []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const placeOrder = async () => {
    // Check if address or guest info is ready
    if (!selectedAddress && !isGuest) {
      alert("Please select a delivery address or checkout as guest");
      setIsGuest(true);
      setShowGuestForm(true);
      return;
    }

    // If guest, validate guest form
    if (isGuest) {
      if (!guestName?.trim() || !guestPhone?.trim() || !guestAddressLine?.trim()) {
        alert('Please fill name, phone and address to continue as guest');
        setShowGuestForm(true);
        return;
      }
    }

    // If logged in but no address, require address
    if (!isGuest && !selectedAddress) {
      alert("Please select a delivery address");
      navigate("/address");
      return;
    }

    try {
      // Get cart items from localStorage (prefer `bag`)
      const bag = JSON.parse(localStorage.getItem("bag") || "null");
      const cart = Array.isArray(bag) && bag.length ? bag.map(i => ({ ...i, quantity: i.quantity || i.qty || 1 })) : JSON.parse(localStorage.getItem("cart") || "[]");

      if (!Array.isArray(cart) || cart.length === 0) {
        alert("Your bag is empty");
        navigate("/");
        return;
      }

      // Create order with all items (or first item if backend only supports single item)
      // For now, create order with first item - can be extended to handle multiple items
      const firstItem = cart[0];
      console.log('🔍 First cart item:', firstItem);
      console.log('🔍 Full cart:', cart);
      
      let productId = firstItem && (firstItem.id || firstItem.productId || firstItem.product_id || (firstItem.product && (firstItem.product.id || firstItem.product._id)) || firstItem._id || firstItem.sku);
      
      console.log('🔍 Extracted productId (before conversion):', productId, 'type:', typeof productId);
      
      // Check if this is a service (string ID like "elec5", "plumb1", etc.)
      const isService = productId && typeof productId === 'string' && !/^\d+$/.test(productId);
      
      // For services, we'll allow string IDs and handle them differently
      // For regular products, coerce to number when possible
      if (!isService && productId != null && !isNaN(Number(productId)) && productId !== '') {
        productId = Number(productId);
      }
      
      console.log('🔍 Final productId:', productId, 'type:', typeof productId, 'isService:', isService);
      
      // Validate: must have an ID (numeric for products, string for services)
      if (!productId || productId === '' || (!isService && (productId === 0 || isNaN(productId)))) {
        console.error('❌ Invalid productId:', productId);
        console.error('Cart item structure:', firstItem);
        alert(`Invalid product in bag.\n\nProduct ID: ${productId}\n\nPlease remove this item and re-add it from the product page.`);
        return;
      }

      // Calculate total amount - validate prices first
      let totalAmount = 0;
      const itemsWithInvalidPrice = [];
      
      cart.forEach(item => {
        const itemPrice = Number(item.price || 0);
        const itemQty = Number(item.quantity || item.qty || 1);
        
        if (itemPrice <= 0) {
          itemsWithInvalidPrice.push(item.title || item.name || 'Unknown');
        } else {
          totalAmount += itemPrice * itemQty;
        }
      });
      
      // If any items have invalid prices, show error and prevent order
      if (itemsWithInvalidPrice.length > 0) {
        alert(`❌ Cannot proceed: The following items don't have valid prices:\n\n${itemsWithInvalidPrice.join('\n')}\n\nPlease remove these items and re-add them from the product page.`);
        return;
      }
      
      if (totalAmount <= 0) {
        alert('❌ Order total is invalid. Please ensure all items have valid prices.');
        return;
      }
      
      console.log('💰 Calculated total amount:', totalAmount);

      if (!isGuest) {
        // Logged in user
        const order = {
          productId: productId,
          qty: firstItem.quantity || firstItem.qty || 1,
          addressId: selectedAddress.id,
          totalAmount: totalAmount
        };
        const res = await api.post("/orders/create", order);
        // Clear bag
        localStorage.setItem("bag", JSON.stringify([]));
        localStorage.setItem("cart", JSON.stringify([]));
        navigate("/payment", { 
          state: { 
            orderId: res.data.orderId || res.data.id, 
            orderDetails: res.data,
            amount: totalAmount
          } 
        });
        return;
      }

      // Guest flow
      const guestAddr = `${guestAddressLine || ''}${guestCity ? ', ' + guestCity : ''}${guestState ? ', ' + guestState : ''}${guestPincode ? ' - ' + guestPincode : ''}`.trim();
      
      // For services (string IDs), store service info in paymentInfo JSON field
      // For regular products, use numeric productId
      const guestOrder = {
        productId: isService ? null : productId, // null for services
        qty: firstItem.quantity || firstItem.qty || 1,
        customerName: guestName,
        customerPhone: guestPhone,
        customerAddress: guestAddr,
        totalAmount: totalAmount,
        // Store service info for services
        serviceInfo: isService ? {
          serviceId: productId,
          serviceName: firstItem.title || firstItem.name || 'Service',
          serviceCategory: firstItem.category || 'Service'
        } : null
      };
      console.debug('Creating guest order payload:', guestOrder);
      console.log('Sending to:', `${API_BASE}/orders/create-guest`);
      const gres = await api.post("/orders/create-guest", guestOrder);
      console.log('Guest order response:', gres.data);
      localStorage.setItem("bag", JSON.stringify([]));
      localStorage.setItem("cart", JSON.stringify([]));
      navigate("/payment", { 
        state: { 
          orderId: gres.data.orderId || gres.data.id, 
          orderDetails: gres.data,
          amount: totalAmount
        } 
      });
      
    } catch (err) {
      console.error("Order creation error:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      const statusCode = err.response?.status;
      
      if (statusCode === 401) {
        alert("Please log in to create an order. Redirecting to login...");
        navigate("/login");
        return;
      }
      
      if (statusCode === 404) {
        alert(`Order endpoint not found. Please check if backend is running.\n\nError: ${errorMessage}\n\nStatus: ${statusCode}`);
        console.error("Backend might not be running or route not mounted. Check:", {
          url: `${API_BASE}/orders/create`,
          status: statusCode,
          error: errorMessage
        });
        return;
      }
      
      alert(`Failed to create order: ${errorMessage}\n\nStatus Code: ${statusCode || 'N/A'}`);
    }
  };

  return (
    <div className="checkout-review-page">
      <div className="checkout-header">
        <h2>🛒 Checkout</h2>
      </div>

      {loading && <div style={{ color: "#666" }}>Loading...</div>}

      {error && (
        <div style={{ color: "crimson", marginBottom: 12, padding: 8, border: "1px solid crimson", borderRadius: 4, background: '#FFF9C4' }}>
          {error}
          {error.includes("log in") && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="checkout-section">
            <h3>📍 Delivery Address</h3>
          </div>

          {selectedAddress ? (
            <div className="address-card">
              <strong>{selectedAddress.name}</strong> ({selectedAddress.phone})
              <br />
              {selectedAddress.addressLine}, {selectedAddress.city},{" "}
              {selectedAddress.state} - {selectedAddress.pincode}
            </div>
          ) : (
            <div>
              <p style={{ color: "crimson" }}>No delivery address selected.</p>
              {!isGuest && (
                <div>
                  <button onClick={() => navigate("/address")}>Add address (login required)</button>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => { setIsGuest(true); setShowGuestForm(true); }}>Checkout as guest</button>
                  </div>
                </div>
              )}

              {isGuest && !showGuestForm && (
                <div>
                  <button onClick={() => setShowGuestForm(true)}>Continue as guest</button>
                </div>
              )}

              {isGuest && showGuestForm && (
                <div style={{ marginTop: 8, padding: 12, border: '1px solid #eee', borderRadius: 6, background: '#fff' }}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Name</label>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Phone</label>
                    <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Address</label>
                    <input value={guestAddressLine} onChange={(e) => setGuestAddressLine(e.target.value)} placeholder="Street / house / locality" />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input style={{ flex: 1 }} value={guestCity} onChange={(e) => setGuestCity(e.target.value)} placeholder="City" />
                    <input style={{ flex: 1 }} value={guestState} onChange={(e) => setGuestState(e.target.value)} placeholder="State" />
                    <input style={{ width: 120 }} value={guestPincode} onChange={(e) => setGuestPincode(e.target.value)} placeholder="Pincode" />
                  </div>
                  <div>
                    <button onClick={() => setShowGuestForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => isGuest ? setShowGuestForm(true) : navigate("/address")}
              style={{
                padding: '10px 16px',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Change Address
            </button>
            <div style={{ flex: 1 }} />
          </div>

          <div className="checkout-section">
            <h3>📦 Order Summary</h3>
          </div>

          {/* Two-column layout: left = products (35%), right = sidebar (offers/ads) */}
          <div className="order-summary-container">
            <div className="order-items-section">
              {cart.length === 0 ? (
                <p style={{ color: "#999", textAlign: 'center', padding: '40px' }}>Your bag is empty</p>
              ) : (
                <div style={{ marginBottom: 20, background: '#FFF9C4', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '2px solid rgba(255, 193, 7, 0.3)' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} className="order-item-card">
                      <div style={{ maxWidth: '70%' }}>
                        <div className="order-item-title">
                          {item.title || item.productName || `Product #${item.id}`}
                        </div>
                        <div className="order-item-quantity">Quantity: {item.quantity}</div>
                      </div>
                      <div className="order-item-price">
                        ₹{item.price && item.price > 0 ? (item.price * item.quantity).toFixed(2) : "N/A"}
                      </div>
                    </div>
                  ))}

                  <div className="order-total">
                    Total: ₹{cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                {(() => {
                  const canProceed = cart.length > 0 && (
                    selectedAddress || 
                    (isGuest && guestName?.trim() && guestPhone?.trim() && guestAddressLine?.trim())
                  );
                  return (
                    <button
                      onClick={placeOrder}
                      disabled={!canProceed}
                      className="payment-button"
                    >
                      {!selectedAddress && !isGuest && !showGuestForm ? (
                        '📍 Select Address First'
                      ) : isGuest && (!guestName?.trim() || !guestPhone?.trim() || !guestAddressLine?.trim()) ? (
                        '✏️ Fill Guest Details'
                      ) : (
                        '💳 Proceed to Payment →'
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>

            <aside className="promo-sidebar">
              <div className="promo-card">
                <h4>🎁 Special Offers</h4>
                <p>Buy 2 get 1 free on selected grocery items. Use code <strong style={{ color: '#e31e24', fontSize: '16px' }}>RRGIFT</strong> at checkout.</p>
              </div>

              <div className="promo-card">
                <h4>📢 Featured Ad</h4>
                <div className="featured-ad-box">
                  Advertise here — reach local customers
                </div>
              </div>

              <div className="promo-card quote-box">
                <h4>💬 Quote of the day</h4>
                <blockquote>
                  "Support local — small purchases, big impact." — RR Nagar
                </blockquote>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}



