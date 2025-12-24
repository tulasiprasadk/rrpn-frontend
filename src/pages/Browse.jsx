// frontend/src/pages/Browse.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../api/client";
import "./Browse.css";

export default function Browse() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read query params from URL
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("categoryId");

  const searchQuery = params.get("q") || "";

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, searchQuery]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`, {
      params: {
  category: categoryId,
  q: searchQuery,
},

      setProducts(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="browse-page">
      {/* Search Bar */}
      <div className="browse-search">
        <input
          type="text"
          value={searchQuery}
          placeholder="Search in RR Nagar"
          onChange={(e) => {
            const value = e.target.value;
            navigate(`/browse?q=${encodeURIComponent(value)}`);
          }}
        />
      </div>

      <h1 className="browse-title">
        {searchQuery
          ? `Search results for "${searchQuery}"`
          : "Products"}
      </h1>

      {loading && <p>Loading products…</p>}

      {!loading && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div className="browse-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="browse-card"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img
              src={product.image || "/images/product-placeholder.png"}
              alt={product.title}
            />
            <h3>{product.title}</h3>
            <p className="price">₹{product.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
