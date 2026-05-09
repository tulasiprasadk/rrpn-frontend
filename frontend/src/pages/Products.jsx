// src/pages/Products.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import CategoryLayout from "../components/CategoryLayout";

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
    <CategoryLayout title={`Products ${searchQuery ? `"${searchQuery}"` : ""}`} category="products">
      <div style={{ padding: "0 0 16px" }}>
        {loading && <p>Loading...</p>}

        {!loading && products.length === 0 && <p>No products found.</p>}

        <div
          className="product-grid"
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: "1.25rem",
            alignItems: "stretch",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </CategoryLayout>
  );
}



