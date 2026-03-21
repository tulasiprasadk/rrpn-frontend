import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/orders");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error loading orders:", err);
        if (err.response?.status === 401) {
          setError("Please log in to view your orders");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(err.response?.data?.error || "Failed to load orders");
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const badge = (text, type) => {
    const colors = {
      pending: "#f4ba00",
      approved: "#2ecc71",
      rejected: "#e74c3c",
      paid: "#2ecc71",
      created: "#3498db",
      delivered: "#16a085",
      default: "#555",
    };

    return (
      <span
        style={{
          background: colors[type] || colors.default,
          color: "white",
          padding: "4px 10px",
          borderRadius: 5,
          fontSize: 12,
          marginRight: 6,
        }}
      >
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>My Orders</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>My Orders</h2>
        <p style={{ color: "#e74c3c" }}>Error: {error}</p>
        {error.includes("log in") ? (
          <div>
            <button onClick={() => navigate("/login")} style={{ marginTop: 10, padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Go to Login
            </button>
          </div>
        ) : (
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((o) => {
        const product = o.Product;
        const date = new Date(o.createdAt).toLocaleDateString();

        return (
          <div
            key={o.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 15,
              marginBottom: 15,
              display: "flex",
              gap: 15,
              cursor: "pointer",
              background: "#fafafa",
            }}
            onClick={() => navigate(`/my-orders/${o.id}`)}
          >
            {/* Product Image */}
            <img
              src={product?.image || "https://via.placeholder.com/90"}
              style={{
                width: 90,
                height: 90,
                borderRadius: 8,
                objectFit: "cover",
              }}
              alt="Product"
            />

            {/* Order Info */}
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ margin: "0 0 5px 0" }}>
                {product?.title || product?.name || "Product"}
                {product?.titleKannada && (
                  <div style={{ fontSize: '14px', color: '#c8102e', marginTop: '2px', fontWeight: 'normal' }}>
                    {product.titleKannada}
                  </div>
                )}
              </h3>

              <p style={{ margin: 0, color: "#444" }}>₹ {o.totalAmount}</p>
              <p style={{ margin: "5px 0", fontSize: 13, color: "#777" }}>
                Ordered on {date}
              </p>

              {/* STATUS BADGES */}
              <div style={{ marginTop: 5 }}>
                {badge("Payment: " + o.paymentStatus, o.paymentStatus)}
                {badge("Order: " + o.status, o.status)}
              </div>
            </div>

            {/* VIEW DETAILS BUTTON */}
            <button
              style={{
                alignSelf: "center",
                padding: "6px 12px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: 5,
                fontSize: 12,
              }}
            >
              View
            </button>
          </div>
        );
      })}
    </div>
  );
}



