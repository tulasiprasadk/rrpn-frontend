/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";

const CartContext = createContext();

export function CrackerCartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Hydrate cart from localStorage on mount for guest users
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bag') || 'null');
      if (Array.isArray(saved) && saved.length > 0) {
        setCart(saved.map(item => ({
          id: item.id,
          title: item.title || item.name || item.id,
          name: item.name || item.title,
          price: Number(item.price || 0),
          qty: Number(item.qty || item.quantity || 1)
        })));
      }
    } catch {
      // ignore
    }
  }, []);

  const addItem = (product) => {
    // Normalize incoming product shape to ensure `id`, `price`, `title`, and `qty` exist
    const normalizedProduct = {
      id: product.id || product._id || (product.product && (product.product.id || product.product._id)) || product.sku || null,
      title: product.title || product.name || product.productName || String(product.id || product._id || ''),
      name: product.name || product.title || null,
      price: Number(product.price || product.amount || 0),
      qty: typeof product.qty === 'number' && product.qty > 0 ? product.qty : (typeof product.quantity === 'number' && product.quantity > 0 ? product.quantity : 1)
    };

    setCart((prev) => {
      const qtyToAdd = normalizedProduct.qty || 1;
      const existing = prev.find((p) => String(p.id) === String(normalizedProduct.id));
      if (existing) {
        return prev.map((p) =>
          String(p.id) === String(normalizedProduct.id) ? { ...p, qty: p.qty + qtyToAdd } : p
        );
      }
      return [...prev, { ...normalizedProduct }];
    });

    // If the user appears logged-in (token present), sync to server cart in background
    try {
      const token = localStorage.getItem("token");
      if (token) {
        (async () => {
          try {
            await axios.post(`${API_BASE}/cart/add`, { productId: normalizedProduct.id, quantity: normalizedProduct.qty }, { withCredentials: true });
            window.dispatchEvent(new Event('cart-updated'));
          } catch (err) {
            // ignore server sync errors (guest/local cart preserved)
            console.error('Failed to sync cart to server', err?.message || err);
            // fallback: persist to localStorage
            try {
              const saved = JSON.parse(localStorage.getItem('bag') || '[]');
              const existing = saved.find(s => String(s.id) === String(normalizedProduct.id));
              const qtyToAdd = normalizedProduct.qty || 1;
              if (existing) {
                existing.qty = (existing.qty || 0) + qtyToAdd;
              } else {
                saved.push({ id: normalizedProduct.id, title: normalizedProduct.title, name: normalizedProduct.name, price: normalizedProduct.price, qty: qtyToAdd });
              }
              localStorage.setItem('bag', JSON.stringify(saved));
              window.dispatchEvent(new Event('cart-updated'));
            } catch {
              // ignore
            }
          }
        })();
      } else {
        // update localStorage for legacy usage by other components/pages that read `bag`
        try {
          const saved = JSON.parse(localStorage.getItem('bag') || '[]');
          const existing = saved.find(s => String(s.id) === String(normalizedProduct.id));
          const qtyToAdd = normalizedProduct.qty || 1;
          if (existing) {
            existing.qty = (existing.qty || 0) + qtyToAdd;
          } else {
            saved.push({ id: normalizedProduct.id, title: normalizedProduct.title, name: normalizedProduct.name, price: normalizedProduct.price, qty: qtyToAdd });
          }
          localStorage.setItem('bag', JSON.stringify(saved));
          window.dispatchEvent(new Event('cart-updated'));
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  };
    // Remove an item from the cart
    const removeItem = (productId) => {
      setCart((prev) => prev.filter(p => String(p.id) !== String(productId)));
      try {
        const token = localStorage.getItem('token');
        if (token) {
          (async () => {
            try {
              await axios.post(`${API_BASE}/cart/remove`, { productId }, { withCredentials: true });
              window.dispatchEvent(new Event('cart-updated'));
            } catch (err) {
              console.error('Failed to remove from server cart', err?.message || err);
            }
          })();
        }
      } catch { /* ignore */ }
    };

    const clearCart = () => {
      setCart([]);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          (async () => {
            try {
              await axios.post(`${API_BASE}/cart/clear`, {}, { withCredentials: true });
              window.dispatchEvent(new Event('cart-updated'));
            } catch (err) {
              console.error('Failed to clear server cart', err?.message || err);
            }
          })();
        }
      } catch { /* ignore */ }
    };

    const updateQty = (id, qty) => {
      setCart((prev) =>
        qty <= 0 ? prev.filter((p) => p.id !== id) :
        prev.map((p) => (p.id === id ? { ...p, qty } : p))
      );

      // If logged-in, sync the delta to server (cart/add expects quantity to add)
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const prevSaved = JSON.parse(localStorage.getItem('bag') || '[]');
          const existing = prevSaved.find(p => String(p.id) === String(id));
          const prevQty = existing ? Number(existing.qty || existing.quantity || 0) : 0;
          const delta = qty - prevQty;
          (async () => {
            try {
              if (delta > 0) {
                await axios.post(`${API_BASE}/cart/add`, { productId: id, quantity: delta }, { withCredentials: true });
              } else if (qty <= 0) {
                await axios.post(`${API_BASE}/cart/remove`, { productId: id }, { withCredentials: true });
              }
              window.dispatchEvent(new Event('cart-updated'));
            } catch (err) {
              console.error('Failed to sync qty update', err?.message || err);
            }
          })();
        }
      } catch { /* ignore */ }
    };

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Persist normalized cart to localStorage whenever it changes
    useEffect(() => {
      try {
        const normalized = cart.map(item => ({
          id: item.id,
          title: item.title || item.name || String(item.id),
          name: item.name || item.title || null,
          price: Number(item.price || 0),
          qty: Number(item.qty || item.quantity || 0)
        }));
        localStorage.setItem('bag', JSON.stringify(normalized));
        window.dispatchEvent(new Event('cart-updated'));
      } catch {
        // ignore
      }
    }, [cart]);

    return (
      <CartContext.Provider value={{ cart, addItem, updateQty, removeItem, clearCart, total }}>
        {children}
      </CartContext.Provider>
    );
}

export const useCrackerCart = () => useContext(CartContext);



