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
    // Extract price from multiple possible fields
    const rawPrice = product.price || product.amount || product.basePrice || product.Price || 0;
    const normalizedPrice = Number(rawPrice);
    
    const normalizedProduct = {
      id: product.id || product._id || (product.product && (product.product.id || product.product._id)) || product.sku || null,
      title: product.title || product.name || product.productName || String(product.id || product._id || ''),
      name: product.name || product.title || null,
      price: normalizedPrice > 0 ? normalizedPrice : 0,
      qty: typeof qty === 'number' && qty > 0 ? qty : (typeof product.quantity === 'number' && product.quantity > 0 ? product.quantity : 1)
    };

    if (!normalizedProduct.id) {
      console.error('Cannot add product without ID:', product);
      alert('Error: Product ID is missing. Please try again.');
      return;
    }
    
    // Warn if price is 0 (but still allow adding for now)
    if (normalizedProduct.price === 0) {
      console.warn('Product added with price 0:', normalizedProduct.title, 'Price fields:', {
        price: product.price,
        amount: product.amount,
        basePrice: product.basePrice,
        Price: product.Price
      });
    }

    setCart((prev) => {
      const qtyToAdd = normalizedProduct.qty || 1;
      const existing = prev.find((p) => String(p.id) === String(normalizedProduct.id));
      let updated;
      if (existing) {
        updated = prev.map((p) =>
          String(p.id) === String(normalizedProduct.id) ? { ...p, qty: p.qty + qtyToAdd } : p
        );
      } else {
        updated = [...prev, { ...normalizedProduct }];
      }
      
      // Save to localStorage immediately with the updated cart
      try {
        localStorage.setItem('bag', JSON.stringify(updated));
        console.log('CrackerCart: Saved to localStorage, bag now has', updated.length, 'items');
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      
      // Dispatch events IMMEDIATELY (localStorage is synchronous)
      // Dispatch event with cart data FIRST for immediate update
      window.dispatchEvent(new CustomEvent('cart-updated-with-data', { 
        detail: { cart: updated, item: normalizedProduct } 
      }));
      
      // Dispatch standard event as backup
      window.dispatchEvent(new Event('cart-updated'));
      
      console.log('CrackerCart: Events dispatched immediately, cart has', updated.length, 'items');
      
      // Also dispatch again after a tiny delay to catch any edge cases
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cart-updated-with-data', { 
          detail: { cart: updated, item: normalizedProduct } 
        }));
        window.dispatchEvent(new Event('cart-updated'));
      }, 50);
      
      return updated;
    });
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

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      removeItem, 
      updateQuantity, 
      updateQty: updateQuantity, // Alias for compatibility
      clearCart,
      total 
    }}>
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
