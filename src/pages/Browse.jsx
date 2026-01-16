// frontend/src/pages/Groceries.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import CartPanel from "../components/CartPanel";

export default function Groceries() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // HARD-LOCKED: Groceries category
  const CATEGORY_ID = 3;

  useEffect(() => {
    loadGroceries();
  }, []);

  async function loadGroceries() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`, {
        params: {
          categoryId: CATEGORY_ID,
        },
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load groceries:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // Group by BUSINESS GROUP (Fruits, Vegetables, etc.), then by VARIETY (from title after ' - ')
  const groupedProducts = products.reduce((acc, product) => {
    const groupKey = product.group || "Others";
    // Parse variety from title after ' - '
    let [name, variety] = (product.title || '').split(" - ");
    variety = variety ? variety.trim() : "Others";
    if (!acc[groupKey]) acc[groupKey] = {};
    if (!acc[groupKey][variety]) acc[groupKey][variety] = [];
    acc[groupKey][variety].push({
      ...product,
      title: name ? name.trim() : product.title // cleaned title for ProductCard
    });
    return acc;
  }, {});

  return (
    <main
      style={{
        background: "#FFFDE7",
        minHeight: "100vh",
        paddingBottom: 40,
      }}
    >
      {/* PAGE HEADER — SAME FEEL AS FLOWERS */}
      <section style={{ padding: "24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CategoryIcon category="groceries" size={36} /> RR Nagar Groceries
        </h1>
        <p style={{ color: "#666", fontSize: 16 }}>
          Daily essentials · Fresh · Local
        </p>
      </section>

      {loading && <p style={{ textAlign: "center" }}>Loading groceries…</p>}

      {!loading && products.length === 0 && (
        <p style={{ textAlign: "center" }}>No groceries found.</p>
      )}

      {/* GROUPED SECTIONS (by group, then by variety) */}
      {!loading &&
        Object.entries(groupedProducts).map(([group, varieties]) => (
          <section key={group} style={{ marginBottom: 48 }}>
            {/* GROUP TITLE */}
            <h2
              style={{
                margin: "0 24px 20px",
                padding: "12px",
                textAlign: "center",
                fontSize: 26,
                fontWeight: 800,
                background: "#FFF3B0",
                borderRadius: 12,
                letterSpacing: 1,
              }}
            >
              {group}
            </h2>

            {/* VARIETY SECTIONS WITHIN GROUP */}
            {Object.entries(varieties).map(([variety, items]) => (
              <div key={variety} style={{ marginBottom: 32, background: '#FFF9C4', borderRadius: 12, padding: 12 }}>
                <h3 style={{ borderBottom: '2px solid #C8102E', paddingBottom: 6, color: '#C8102E', fontSize: 20, textAlign: 'center' }}>{variety}</h3>
                <div
                  style={{
                    display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: 16,
                    padding: "0 24px",
                  }}
                >
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

      <CartPanel />
    </main>
  );
}



