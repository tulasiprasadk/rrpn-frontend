import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";

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
    if (!selectedAddress && !isGuest) {
      alert("Please select a delivery address or checkout as guest");
      return;
    }

    try {
      // Get cart items from localStorage (prefer `bag`)
      const bag = JSON.parse(localStorage.getItem("bag") || "null");
      const cart = Array.isArray(bag) && bag.length ? bag.map(i => ({ ...i, quantity: i.quantity || i.qty || 1 })) : JSON.parse(localStorage.getItem("cart") || "[]");

      if (!Array.isArray(cart) || cart.length === 0) {
        alert("Your bag is empty");
        return;
      }

      // Create order with first item (cart items may use different id keys)
      const firstItem = cart[0];
      let productId = firstItem && (firstItem.id || firstItem.productId || firstItem.product_id || (firstItem.product && (firstItem.product.id || firstItem.product._id)) || firstItem._id || firstItem.sku);
      // Coerce to number when possible
      if (productId != null && !isNaN(Number(productId))) productId = Number(productId);
      if (!productId) {
        alert('Invalid product in bag. Please re-add the item from the product page.');
        return;
      }

      if (!isGuest) {
        const order = {
          productId: productId,
          qty: firstItem.quantity || firstItem.qty || 1,
          addressId: selectedAddress.id,
        };
        const res = await api.post("/orders/create", order);
        // Clear bag
        localStorage.setItem("bag", JSON.stringify([]));
        localStorage.setItem("cart", JSON.stringify([]));
        navigate("/payment", { state: { orderId: res.data.orderId, orderDetails: res.data } });
        return;
      }

      // Guest flow
      const guestAddr = `${guestAddressLine || ''}${guestCity ? ', ' + guestCity : ''}${guestState ? ', ' + guestState : ''}${guestPincode ? ' - ' + guestPincode : ''}`.trim();
      if (isGuest) {
        if (!guestName?.trim() || !guestPhone?.trim() || !guestAddressLine?.trim()) {
          alert('Please fill name, phone and address to continue as guest');
          return;
        }
      }
      const guestOrder = {
        productId: productId,
        qty: firstItem.quantity || firstItem.qty || 1,
        customerName: guestName,
        customerPhone: guestPhone,
        customerAddress: guestAddr
      };
      console.debug('Creating guest order payload:', guestOrder);
      const gres = await api.post("/orders/create-guest", guestOrder);
      localStorage.setItem("bag", JSON.stringify([]));
      localStorage.setItem("cart", JSON.stringify([]));
      navigate("/payment", { state: { orderId: gres.data.orderId, orderDetails: gres.data } });
      
    } catch {
      console.error("Order creation error:", err);
      alert("Failed to create order: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: 20, background: '#FFFDE7', minHeight: '100vh', borderRadius: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      <h2 style={{ background: '#FFF9C4', padding: '12px 0', borderRadius: '10px', textAlign: 'center', marginBottom: 18 }}>Checkout</h2>

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
          <h3 style={{ background: '#FFF9C4', padding: '8px 0', borderRadius: '8px', textAlign: 'center', marginBottom: 12 }}>Delivery Address</h3>

          {selectedAddress ? (
            <div
              style={{
                border: "1px solid #ddd",
                padding: 15,
                borderRadius: 8,
                marginBottom: 10,
                background: '#FFF9C4'
              }}
            >
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

          <h3 style={{ background: '#FFF9C4', padding: '8px 0', borderRadius: '8px', textAlign: 'center', marginBottom: 12 }}>Order Summary</h3>

          {/* Two-column layout: left = products (30%), right = sidebar (offers/ads) */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 30%', minWidth: 260 }}>
              {cart.length === 0 ? (
                <p style={{ color: "#999" }}>Your bag is empty</p>
              ) : (
                <div style={{ marginBottom: 20, background: '#FFF9C4', borderRadius: 10, padding: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #eee",
                        padding: 10,
                        marginBottom: 10,
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: '#FFFDE7'
                      }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        <strong style={{ display: 'block' }}>
                          {item.title || item.productName || `Product #${item.id}`}
                        </strong>
                        <div style={{ color: '#666', fontSize: 13 }}>Quantity: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: "bold", color: "#28a745" }}>
                        ₹{item.price ? (item.price * item.quantity).toFixed(2) : "N/A"}
                      </div>
                    </div>
                  ))}

                  <div style={{ textAlign: 'right', paddingTop: 10, borderTop: '1px dashed #e0e0e0', fontWeight: 700 }}>
                    Total: ₹{cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <button
                  onClick={placeOrder}
                  disabled={!((selectedAddress || isGuest) && cart.length > 0)}
                  style={{
                    padding: '12px 20px',
                    background: (selectedAddress || isGuest) && cart.length > 0 ? 'linear-gradient(90deg,#28a745,#1e7e34)' : '#e0e0e0',
                    color: (selectedAddress || isGuest) && cart.length > 0 ? 'white' : '#888',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    minWidth: 200,
                    cursor: (selectedAddress || isGuest) && cart.length > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: (selectedAddress || isGuest) && cart.length > 0 ? '0 6px 18px rgba(46,125,50,0.18)' : 'none'
                  }}
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>

            <aside style={{ flex: '1 1 65%', minWidth: 260 }}>
              <div style={{ background: 'white', padding: 14, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 12 }}>
                <h4 style={{ margin: '0 0 8px' }}>Special Offers</h4>
                <p style={{ margin: 0, color: '#555' }}>Buy 2 get 1 free on selected grocery items. Use code <strong>RRGIFT</strong> at checkout.</p>
              </div>

              <div style={{ background: '#fff8e1', padding: 14, borderRadius: 10, border: '1px solid #ffe082', marginBottom: 12 }}>
                <h4 style={{ margin: '0 0 8px' }}>Featured Ad</h4>
                <div style={{ height: 120, background: 'linear-gradient(90deg,#ffd54f,#ffb300)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a2b00', fontWeight: 700 }}>
                  Advertise here — reach local customers
                </div>
              </div>

              <div style={{ background: 'white', padding: 14, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 8px' }}>Quote of the day</h4>
                <blockquote style={{ margin: 0, color: '#444', fontStyle: 'italic' }}>
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



