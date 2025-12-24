import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API = process.env.REACT_APP_API_BASE;

export default function SupplierEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/supplier/products/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setPrice(data.price || '');
        setStock(data.stock || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/supplier/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ price, stock })
      });
      if (res.ok) {
        alert('Product updated!');
        navigate('/supplier/products');
      } else {
        const err = await res.json();
        setError(err.error || 'Update failed');
      }
    } catch {
      setError('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input value={product.title} disabled style={{ width: '100%' }} />
        </div>
        <div>
          <label>Price:</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%' }} required />
        </div>
        <div>
          <label>Stock:</label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} style={{ width: '100%' }} required />
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/supplier/products')} style={{ marginLeft: 8 }}>Cancel</button>
      </form>
    </div>
  );
}
