import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierSidebar from "../../components/dashboard/SupplierSidebar";
import api from "../../api/client";
import "../../components/dashboard/Sidebar.css";
import "./SupplierProducts.css";

export default function SupplierProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products?supplier=true");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Products load error:", err);
      if (err.response?.status === 401) {
        navigate("/supplier/login");
        return;
      }
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      alert("Failed to delete product");
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Products & Pricing</h1>
          <button
            onClick={() => navigate("/supplier/products/add")}
            style={{
              padding: '12px 24px',
              background: '#ffd700',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            + Add New Product
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ color: '#666', marginBottom: '0.5rem' }}>No Products Yet</h2>
            <p style={{ color: '#999', marginBottom: '1.5rem' }}>You haven't added any products yet. Click "Add New Product" to get started.</p>
            <button
              onClick={() => navigate("/supplier/products/add")}
              style={{
                padding: '12px 24px',
                background: '#ffd700',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              + Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                <img
                  src={p.image || '/placeholder.png'}
                  alt={p.title || 'Product'}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '20px' }}>{p.title}</h3>
                  <p style={{ margin: '0.5rem 0', color: '#666' }}>
                    <strong>Price:</strong> ₹{parseFloat(p.price || 0).toLocaleString()}
                  </p>
                  {p.description && (
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>{p.description.substring(0, 100)}...</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => navigate(`/supplier/products/${p.id}/edit`)}
                    style={{
                      padding: '8px 16px',
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
