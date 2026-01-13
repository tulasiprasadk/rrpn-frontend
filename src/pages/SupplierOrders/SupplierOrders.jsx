import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierSidebar from "../../components/dashboard/SupplierSidebar";
import api from "../../api/client";
import "../../components/dashboard/Sidebar.css";

export default function SupplierOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/supplier/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Orders load error:", err);
      if (err.response?.status === 401) {
        navigate("/supplier/login");
        return;
      }
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (id) => {
    try {
      await api.put(`/supplier/orders/${id}/deliver`);
      alert("Order marked as delivered");
      loadOrders();
    } catch (err) {
      console.error("Mark delivered error:", err);
      alert("Failed to mark order as delivered");
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '80vh', background: '#f8f9fa', position: 'relative' }}>
      <SupplierSidebar />
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        maxWidth: 'calc(100vw - 250px)',
        boxSizing: 'border-box',
        minWidth: 0,
        position: 'relative'
      }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '28px', fontWeight: 'bold' }}>My Orders</h1>

        {error && (
          <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ color: '#666', marginBottom: '0.5rem' }}>No Orders Yet</h2>
            <p style={{ color: '#999' }}>You haven't received any orders yet. Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {orders.map((order) => {
              const address = order.Address;
              const product = order.Product;

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: order.status === 'delivered' ? '2px solid #4caf50' : '1px solid #ddd'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '20px' }}>Order #{order.id}</h3>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Product:</strong> {product?.title || 'Unknown Product'}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Quantity:</strong> {order.qty || 1}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Amount:</strong> ₹{parseFloat(order.totalAmount || 0).toLocaleString()}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Status:</strong> <span style={{ 
                          color: order.status === 'delivered' ? '#4caf50' : order.status === 'paid' ? '#2196f3' : '#ff9800',
                          fontWeight: '600'
                        }}>{order.status || 'created'}</span>
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Payment Status:</strong> <span style={{ 
                          color: order.paymentStatus === 'approved' ? '#4caf50' : '#ff9800',
                          fontWeight: '600'
                        }}>{order.paymentStatus || 'pending'}</span>
                      </p>
                    </div>
                    {order.status !== "delivered" && (
                      <button
                        onClick={() => markDelivered(order.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>

                  {address && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '1rem', 
                      background: '#f5f5f5', 
                      borderRadius: '4px' 
                    }}>
                      <strong>Delivery Address:</strong>
                      <p style={{ margin: '0.5rem 0 0', color: '#666' }}>
                        {address.name} ({address.phone})
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        {address.addressLine}, {address.city}, {address.state} – {address.pincode}
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', fontSize: '12px', color: '#999' }}>
                    Order Date: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
