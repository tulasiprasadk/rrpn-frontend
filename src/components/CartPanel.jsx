import React, { useState, useEffect } from "react";
import { useCrackerCart } from "../context/CrackerCartContext";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * CartPanel
 * @param {string} deliveryNote - e.g. "Delivery in 7–15 days" or "Same-day / Next-day delivery"
 * @param {string} orderType - e.g. "CRACKERS", "FLOWERS"
 */
export default function CartPanel() {
  const { user } = useAuth();
  const [bag, setBag] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 900;
  });
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 900;
  });
  const { cart } = useCrackerCart();

  const readLocalBag = () => {
    try {
      const token = localStorage.getItem("token");
      const cartActive = sessionStorage.getItem("rrnagar_cart_active") === "1";
      if (!token && !cartActive) return [];
      const bagData = JSON.parse(localStorage.getItem("bag") || "[]");
      return Array.isArray(bagData) ? bagData : [];
    } catch {
      return [];
    }
  };

  const loadBag = async () => {
    // Always use localStorage as the primary source for UI sync
    const localBag = readLocalBag();
    if (localBag.length > 0) {
      setBag(localBag);
      setLoading(false);
      return;
    }

    if (user) {
      try {
        const res = await api.get("/cart");
        const serverItems = res.data?.items || [];
        setBag(serverItems);
      } catch {
        setBag([]);
      }
    } else {
      // use in-memory CrackerCart context for guest users
      setBag(Array.isArray(cart) ? cart : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBag();
    // Listen for localStorage changes — keep for legacy flows
    const onStorage = () => loadBag();
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => {
      // Poll localStorage to stay in sync with header/bag count
      const localBag = readLocalBag();
      setBag(localBag);
      setLoading(false);
    }, 1000);
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, [user]);

  // When the in-memory cart (context) changes, update displayed bag for guests
  useEffect(() => {
    if (!user) setBag(Array.isArray(cart) ? cart : []);
  }, [cart, user]);

  // Listen for custom events to reload cart after add/remove
  useEffect(() => {
    const handler = () => loadBag();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [user]);

  if (loading) return <div className="cart-panel">Loading bag...</div>;

  const panelStyle = {
    minWidth: isMobile ? "100%" : 320,
    background: "#fff",
    borderLeft: isMobile ? "none" : "1px solid #eee",
    borderTop: isMobile ? "1px solid #eee" : "none",
    padding: 16,
    position: isMobile ? "static" : "sticky",
    top: isMobile ? "auto" : 0,
    right: isMobile ? "auto" : 0,
    minHeight: isMobile ? "auto" : "100vh",
    zIndex: 10,
    width: isMobile ? "100%" : "auto",
  };

  return (
    <div className="cart-panel" style={panelStyle}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{display:'inline-flex', alignItems: 'center', gap: 8}}>
          <span style={{display:'inline-flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7L6.5 6C7 4 8 3 12 3C16 3 17 4 17.5 6L18 7H6Z" fill="#FFE082"/><path d="M5 7H19L18 20H6L5 7Z" fill="#FFB74D"/></svg></span>
          Bag
        </span>
        {isMobile && (
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{ border: '1px solid #ddd', background: '#fff', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        )}
      </h3>
      {isMobile && collapsed ? (
        <div style={{ color: '#666', fontSize: 13 }}>Bag hidden (tap Show)</div>
      ) : (
        <>
      {bag.length === 0 ? (
        <div style={{ color: '#888' }}>Your bag is empty</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bag.map(item => (
            <li key={item.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{item.title || item.name}</div>
              <div>Qty: {item.quantity || item.qty} × ₹{item.price}</div>
              <div style={{ color: '#28a745', fontWeight: 500 }}>Subtotal: ₹{((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
      {bag.length > 0 && (
        <div style={{ marginTop: 16, fontWeight: 600 }}>
          Total: ₹{bag.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || item.qty || 1), 0).toFixed(2)}
        </div>
      )}
      <button style={{ marginTop: 16, width: '100%', padding: 10, background: '#ffcc00', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }} onClick={() => window.location.href = '/bag'}>
        Go to Bag
      </button>
        </>
      )}
    </div>
  );
}



