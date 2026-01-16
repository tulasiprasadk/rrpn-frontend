import React, { useState, useEffect } from "react";
import PaymentOptions from "../components/PaymentOptions";
import { fetchOrder } from "../api/orders";
import "./Checkout.mobile.css";

/**
 * Example Checkout page.
 * - Loads a 'cart' from localStorage (simple cart format expected)
 * - Shows PaymentOptions and a success view after order is created.
 */
export default function Checkout() {
  const [cart] = useState(() => {
    try {
      const bag = JSON.parse(localStorage.getItem("bag") || "null");
      if (Array.isArray(bag) && bag.length) return bag.map(it => ({ ...it, qty: it.qty || it.quantity || it.qty || 1 }));
      // fallback to legacy 'cart'
      const legacy = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(legacy) ? legacy.map(it => ({ ...it, qty: it.qty || it.quantity || 1 })) : [];
    } catch {
      return [];
    }
  });
  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const [order, setOrder] = useState(null);

  function handleSuccess(createdOrder) {
    // createdOrder returned from json-server will have id
    setOrder(createdOrder);
    // optionally clear cart
    localStorage.removeItem("cart");
  }

  useEffect(() => {
    // If the user returns from an external flow with an orderId param, fetch it:
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    if (orderId) {
      fetchOrder(orderId).then(setOrder).catch(() => {});
    }
  }, []);

  if (order) {
    return (
      <main
        className="checkout-page-root"
        style={{ padding: 20, background: '#FFFDE7', minHeight: '100vh', borderRadius: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
      >
        <h2 style={{ background: '#FFF9C4', padding: '12px 0', borderRadius: '10px', textAlign: 'center', marginBottom: 18 }}>Order placed</h2>
        <div style={{ background: '#FFF9C4', padding: 18, borderRadius: 10, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <p>Order id: {order.id}</p>
          <p>Payment method: {order.paymentMethod}</p>
          <p>Paid: {order.paid ? "Yes" : "No"}</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="checkout-page-root"
      style={{ padding: 20, background: '#FFFDE7', minHeight: '100vh', borderRadius: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
    >
      <h2 style={{ background: '#FFF9C4', padding: '12px 0', borderRadius: '10px', textAlign: 'center', marginBottom: 18 }}>Checkout</h2>
      <div className="checkout-layout" style={{ display: "flex", gap: 24 }}>
        <section className="checkout-items" style={{ flex: 2, background: '#FFF9C4', borderRadius: 10, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <h3 style={{ marginBottom: 12 }}>Items</h3>
          {cart.length === 0 ? <div>No items in bag</div> : cart.map((it) => (
            <div key={it.id} style={{ borderBottom: "1px solid #eee", padding: 8 }}>
              {it.title} ₹{it.price} × {it.qty}
            </div>
          ))}
          <div style={{ marginTop: 12 }}><strong>Total: ₹{total}</strong></div>
        </section>
        <aside className="checkout-sidebar" style={{ width: 360, background: '#FFF9C4', borderRadius: 10, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <PaymentOptions items={cart} total={total} onSuccess={handleSuccess} />
        </aside>
      </div>
    </main>
  );
}



