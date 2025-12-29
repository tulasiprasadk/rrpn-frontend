// src/pages/Flowers.jsx

import { useEffect, useState } from "react";
import { API_BASE } from "../api/client";
import ProductCard from "../components/ProductCard";
import CartPanel from "../components/CartPanel";

// Map common flower names to emojis
const flowerEmojiMap = {
  "ROSE": "🌹",
  "JASMINE": "🌼",
  "MARIGOLD": "🌻",
  "LILY": "🌺",
  "LOTUS": "🪷",
  "TULIP": "🌷",
  "CHRYSANTHEMUM": "💮",
  "GERBERA": "🌸",
  "ORCHID": "🦋",
  "CARNATION": "🥀",
  "MOGRA": "🌼",
  "DAISY": "🌼",
  "HIBISCUS": "🌺",
  "TUBE ROSE": "🌾",
  "GLADIOLUS": "🌷",
  "ANTHURIUM": "🌺",
  "RAJANIGANDHA": "🌾",
  "OTHERS": "💐"
};

export default function Flowers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/products?categoryId=4`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  // Group products by VARIETY (after ' - '), default to 'Others'
  const grouped = products.reduce((acc, p) => {
    let [name, variety] = p.title.split(" - ");
    variety = variety ? variety.trim() : "Others";
    // Pick emoji based on flower name (case-insensitive)
    let flowerName = (name || p.title || "").trim().toUpperCase();
    let emoji = flowerEmojiMap[flowerName] || flowerEmojiMap[variety.toUpperCase()] || "💐";
    if (!acc[variety]) acc[variety] = [];
    acc[variety].push({
      ...p,
      title: name ? name.trim() : p.title, // cleaned title for ProductCard
      emoji
    });
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 16 }}>🌸 Flowers</h1>

        {loading && <p>Loading...</p>}
        {!loading && products.length === 0 && <p>No flowers available</p>}

        {!loading &&
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([variety, items]) => (
              <div key={variety} style={{ marginBottom: 32, background: '#FFF9C4', borderRadius: 12, padding: 12 }}>
                <h2 style={{ borderBottom: '2px solid #C8102E', paddingBottom: 6, color: '#C8102E', fontSize: 20, textAlign: 'center' }}>{variety}</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                    marginTop: 16
                  }}
                >
                  {items
                    .slice()
                    .sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""))
                    .map(product => (
                      <div style={{ minWidth: 0, display: 'flex' }} key={product.id}>
                        <ProductCard
                          product={product}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            maxWidth: '100%',
                            height: 320,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
      </div>
      <div style={{
        position: 'sticky',
        top: 32,
        alignSelf: 'flex-start',
        height: 'fit-content',
        zIndex: 10
      }}>
        <CartPanel orderType="FLOWERS" />
      </div>
    </div>
  );
}
