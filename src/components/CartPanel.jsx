import React, { useState, useEffect, useCallback } from "react";
import { useCrackerCart } from "../context/CrackerCartContext";
import axios from "axios";
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
  const { cart } = useCrackerCart();

  // Direct function to load bag from localStorage (for guest users)
  const loadBagFromStorage = useCallback(() => {
    if (user) return; // Skip for logged-in users
    
    try {
      const saved = JSON.parse(localStorage.getItem('bag') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        const bagData = saved.map(item => ({
          id: item.id,
          title: item.title || item.name,
          name: item.name || item.title,
          price: Number(item.price || 0),
          qty: Number(item.qty || item.quantity || 1),
          quantity: Number(item.qty || item.quantity || 1)
        }));
        console.log('CartPanel: Loaded from localStorage', bagData.length, 'items');
        setBag(bagData);
        setLoading(false);
        return bagData;
      } else {
        console.log('CartPanel: localStorage bag is empty');
        setBag([]);
        setLoading(false);
        return [];
      }
    } catch (err) {
      console.error('CartPanel: Error reading localStorage', err);
      setBag([]);
      setLoading(false);
      return [];
    }
  }, [user]);

  // Sync function that always reads from localStorage for guest users
  const syncFromStorage = useCallback(() => {
    if (user) return;
    loadBagFromStorage();
  }, [user, loadBagFromStorage]);

  const loadBag = useCallback(async () => {
    if (user) {
      try {
        const res = await axios.get("/api/cart", { withCredentials: true });
        setBag(res.data.items || []);
      } catch {
        setBag([]);
      }
      setLoading(false);
    } else {
      // For guest users: prioritize cart context, fallback to localStorage
      let bagData = [];
      
      // First, try to use cart from context
      if (Array.isArray(cart) && cart.length > 0) {
        bagData = cart.map(item => ({
          id: item.id,
          title: item.title || item.name,
          name: item.name || item.title,
          price: Number(item.price || 0),
          qty: Number(item.qty || item.quantity || 1),
          quantity: Number(item.qty || item.quantity || 1)
        }));
        console.log('CartPanel: Using cart from context', bagData.length, 'items');
      } else {
        // Fallback: read directly from localStorage
        bagData = loadBagFromStorage();
        return; // loadBagFromStorage already calls setBag and setLoading
      }
      
      setBag(bagData);
      setLoading(false);
    }
  }, [user, cart, loadBagFromStorage]);

  // Initial load on mount
  useEffect(() => {
    console.log('CartPanel: Initial mount, loading bag...');
    loadBag();
  }, []);

  // When cart context changes, sync from localStorage immediately for guest users
  useEffect(() => {
    if (!user) {
      console.log('CartPanel: cart context changed, syncing from localStorage...', cart?.length || 0, 'items');
      // Always sync from localStorage as the source of truth for guest users
      syncFromStorage();
    }
  }, [cart, user, syncFromStorage]);

  // Listen for custom events to reload cart after add/remove
  useEffect(() => {
    const handler = () => {
      console.log('CartPanel: cart-updated event received');
      if (!user) {
        // For guest users, read directly from localStorage immediately
        // Use a very short delay to ensure localStorage write completes
        setTimeout(() => {
          syncFromStorage();
        }, 50);
      } else {
        // For logged-in users, reload from API
        loadBag();
      }
    };
    
    const handlerWithData = (e) => {
      console.log('CartPanel: cart-updated-with-data event received', e.detail);
      if (!user && e.detail?.cart) {
        // Use the cart data directly from the event for immediate update
        const bagData = e.detail.cart.map(item => ({
          id: item.id,
          title: item.title || item.name,
          name: item.name || item.title,
          price: Number(item.price || 0),
          qty: Number(item.qty || item.quantity || 1),
          quantity: Number(item.qty || item.quantity || 1)
        }));
        console.log('CartPanel: Updating from event data', bagData.length, 'items');
        setBag(bagData);
        setLoading(false);
        // Also sync from localStorage to ensure consistency
        setTimeout(() => syncFromStorage(), 100);
      } else if (!user) {
        // Fallback to localStorage if event data not available
        syncFromStorage();
      } else {
        loadBag();
      }
    };
    
    window.addEventListener("cart-updated", handler);
    window.addEventListener("cart-updated-with-data", handlerWithData);
    
    // Also listen for storage events (for cross-tab updates)
    const storageHandler = () => {
      if (!user) {
        console.log('CartPanel: storage event received');
        syncFromStorage();
      }
    };
    window.addEventListener("storage", storageHandler);
    
    // Poll localStorage every 200ms for guest users (more aggressive polling)
    let pollInterval = null;
    if (!user) {
      pollInterval = setInterval(() => {
        try {
          const saved = JSON.parse(localStorage.getItem('bag') || '[]');
          const currentBagLength = Array.isArray(bag) ? bag.length : 0;
          const savedLength = Array.isArray(saved) ? saved.length : 0;
          
          if (savedLength !== currentBagLength) {
            console.log(`CartPanel: Poll detected change (${currentBagLength} → ${savedLength}), syncing...`);
            syncFromStorage();
          }
        } catch (err) {
          console.error('CartPanel: Poll error:', err);
        }
      }, 200); // Reduced from 500ms to 200ms for faster updates
    }
    
    return () => {
      window.removeEventListener("cart-updated", handler);
      window.removeEventListener("cart-updated-with-data", handlerWithData);
      window.removeEventListener("storage", storageHandler);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [user, loadBag, syncFromStorage, bag.length]);

  if (loading) return <div className="cart-panel">Loading bag...</div>;

  return (
    <div className="cart-panel" style={{ minWidth: 320, background: '#fff', borderLeft: '1px solid #eee', padding: 16, position: 'sticky', top: 0, right: 0, minHeight: '100vh', zIndex: 10 }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{display:'inline-flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7L6.5 6C7 4 8 3 12 3C16 3 17 4 17.5 6L18 7H6Z" fill="#FFE082"/><path d="M5 7H19L18 20H6L5 7Z" fill="#FFB74D"/></svg></span> Bag</h3>
      {bag.length === 0 ? (
        <div style={{ color: '#888' }}>Your bag is empty</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bag.map((item, index) => {
            const itemId = item.id || `item-${index}`;
            const itemTitle = item.title || item.name || 'Unknown Product';
            const itemQty = item.quantity || item.qty || 1;
            const itemPrice = Number(item.price || 0);
            const subtotal = itemPrice * itemQty;
            
            return (
              <li key={itemId} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{itemTitle}</div>
                <div>Qty: {itemQty} × ₹{itemPrice > 0 ? itemPrice.toFixed(2) : 'N/A'}</div>
                <div style={{ color: '#28a745', fontWeight: 500 }}>
                  Subtotal: ₹{subtotal > 0 ? subtotal.toFixed(2) : '0.00'}
                </div>
              </li>
            );
          })}
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



