import React, { useState, useEffect } from "react";
import { useCrackerCart } from "../context/CrackerCartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * CartPanel
 * @param {string} deliveryNote - e.g. "Delivery in 7–15 days" or "Same-day / Next-day delivery"
 * @param {string} orderType - e.g. "CRACKERS", "FLOWERS"
 */
export default function CartPanel({
  deliveryNote = "",
  orderType = "GENERAL"
}) {
  const { user } = useAuth();
  const [bag, setBag] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBag = async () => {
    if (user) {
      try {
        const res = await axios.get("/api/cart", { withCredentials: true });
        setBag(res.data.items || []);
      } catch {
        setBag([]);
      }
    } else {
      const savedBag = JSON.parse(localStorage.getItem("bag") || "[]");
      setBag(savedBag);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBag();
    // Listen for localStorage changes (for guests)
    const onStorage = () => !user && loadBag();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line
  }, [user]);

  // Listen for custom events to reload cart after add/remove
  useEffect(() => {
    const handler = () => loadBag();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [user]);

  if (loading) return <div className="cart-panel">Loading bag...</div>;

  return (
    <div className="cart-panel" style={{ minWidth: 320, background: '#fff', borderLeft: '1px solid #eee', padding: 16, position: 'sticky', top: 0, right: 0, minHeight: '100vh', zIndex: 10 }}>
      <h3 style={{ marginTop: 0 }}>🛍️ Bag</h3>
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
    </div>
  );
}
