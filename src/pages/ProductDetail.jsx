
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        console.error("Product fetch failed", err);
        setError("Server error while loading product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: 32 }}>Loading product…</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
  if (!product) return null;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: 'auto' }}>
      <h1>{product.title || product.name}</h1>
      <img src={product.imageUrl || product.image} alt={product.title || product.name} style={{ width: 300, borderRadius: 8 }} loading="lazy" />
      <p style={{ fontSize: 18, margin: '16px 0' }}>{product.description}</p>
      <h2 style={{ color: '#e31e24' }}>₹{product.price}</h2>
      <div style={{ marginTop: 24 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 18px', fontSize: 16 }}>Back</button>
      </div>
    </div>
  );
}



