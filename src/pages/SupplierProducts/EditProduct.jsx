
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditProduct.css";
import { API_BASE } from "../../config/api";

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      setError('Product ID is required');
      setLoading(false);
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');

      // Get token from localStorage (supplier authentication)
      const token = localStorage.getItem('token');
      
      const res = await fetch(
        `${API_BASE}/supplier/products/${productId}`,
        {
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load product');
        setLoading(false);
        return;
      }

      // Backend returns data directly: { id, title, price, stock, status }
      setProduct(data);
      setPrice(data.price || '');
      setStock(data.stock || '');
      setLoading(false);
    } catch (err) {
      console.error("Error loading product:", err);
      setError('Failed to load product. Please check your connection.');
      setLoading(false);
    }
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    if (!price || stock === '') {
      setError('Price and stock are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${API_BASE}/supplier/products/${productId}`,
        {
          method: "PUT",
          credentials: 'include',
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            price: parseFloat(price), 
            stock: parseInt(stock) 
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update product');
        setSaving(false);
        return;
      }

      alert("Product Updated!");
      navigate('/supplier/products');
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading product...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '20px', fontSize: '16px' }}>{error}</div>
        <button 
          onClick={loadProduct} 
          style={{ 
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Product not found</div>
      </div>
    );
  }

  return (
    <div className="ep-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>Edit Product</h1>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={saveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Product Title (Read-only)
          </label>
          <input
            type="text"
            value={product.title || ''}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: '#f5f5f5',
              cursor: 'not-allowed',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Price (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Stock (Quantity) *
          </label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>

        {product.status && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Status
            </label>
            <input
              type="text"
              value={product.status}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#f5f5f5',
                cursor: 'not-allowed',
                fontSize: '16px',
                textTransform: 'capitalize'
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: saving ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/supplier/products')}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
