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

  const addItem = (product, qty = 1) => {
    const normalizedProduct = {
      id: product.id || product._id || (product.product && (product.product.id || product.product._id)) || product.sku || null,
      title: product.title || product.name || product.productName || String(product.id || product._id || ''),
      name: product.name || product.title || null,
      price: Number(product.price || product.amount || product.basePrice || 0),
      qty: typeof qty === 'number' && qty > 0 ? qty : (typeof product.quantity === 'number' && product.quantity > 0 ? product.quantity : 1)
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

    // Save to localStorage
    try {
      const updated = [...cart];
      const existing = updated.find((p) => String(p.id) === String(normalizedProduct.id));
      if (existing) {
        existing.qty += qtyToAdd;
      } else {
        updated.push(normalizedProduct);
      }
      localStorage.setItem('bag', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const updated = prev.filter((p) => String(p.id) !== String(id));
      try {
        localStorage.setItem('bag', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((p) =>
        String(p.id) === String(id) ? { ...p, qty } : p
      );
      try {
        localStorage.setItem('bag', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('bag');
    } catch {
      // ignore
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCrackerCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCrackerCart must be used within CrackerCartProvider");
  }
  return context;
}
