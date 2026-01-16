// src/pages/Products.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import CartPanel from "../components/CartPanel";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [params] = useSearchParams();
  const searchQuery = params.get("search") || "";

  useEffect(() => {
    setLoading(true);

    getProducts(searchQuery)
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [searchQuery]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "2rem" }}>
      <h2>Products {searchQuery ? `"${searchQuery}"` : ""}</h2>

      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: "1rem",
          alignItems: "stretch"
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      </div>
      <div style={{
        position: 'sticky',
        top: 32,
        alignSelf: 'flex-start',
        height: 'fit-content',
        zIndex: 10
      }}>
        <CartPanel />
      </div>
    </div>
  );
}



