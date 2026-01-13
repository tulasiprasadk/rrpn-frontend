

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/products`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      .then(r => r.json()).then(setProducts).catch(console.error);
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <h2>Manage Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
        {products.map(p => (
          <div key={p._id || p.id} style={{ border: '1px solid #ddd', padding: 12 }}>
            <img src={p.images && p.images[0]} style={{ width: '100%', height: 120, objectFit: 'cover' }} alt={p.name ? `Product image of ${p.name}` : 'Product image'} loading="lazy" />
            <h4>{p.name || p.title}</h4>
            <p>Variants: {p.variants?.length || 0}</p>
            <p>Status: {p.status}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/supplier/products/${p._id || p.id}/edit`)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



