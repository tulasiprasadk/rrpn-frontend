// Emoji and Kannada mapping for common crackers
const crackerInfo = {
  "Sparklers": { emoji: "✨", kn: "ಸ್ಪಾರ್ಕ್ಲರ್ಸ್" },
  "Flowerpot": { emoji: "🏵️", kn: "ಫ್ಲವರ್ ಪಾಟ್" },
  "Chakra": { emoji: "🌀", kn: "ಚಕ್ರ" },
  "Rocket": { emoji: "🚀", kn: "ರಾಕೆಟ್" },
  "Bomb": { emoji: "💣", kn: "ಬಾಂಬ್" },
  "Pencil": { emoji: "✏️", kn: "ಪೆನ್ಸಿಲ್" },
  "Twinkling Star": { emoji: "🌟", kn: "ಟ್ವಿಂಕ್ಲಿಂಗ್ ಸ್ಟಾರ್" },
  "Ground Chakkar": { emoji: "🌀", kn: "ಗ್ರೌಂಡ್ ಚಕ್ರ" },
  "Anar": { emoji: "🎇", kn: "ಅನಾರ್" },
  "Bijili": { emoji: "⚡", kn: "ಬಿಜಿಲಿ" },
  "Zamin Chakkar": { emoji: "🌀", kn: "ಜಮೀನ್ ಚಕ್ರ" },
  "Rocket Bomb": { emoji: "🚀", kn: "ರಾಕೆಟ್ ಬಾಂಬ್" },
  "Deluxe": { emoji: "🎆", kn: "ಡಿಲಕ್ಸ್" },
  // Add more as needed
};
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { API_BASE } from "../api/client";
import CartPanel from "../components/CartPanel";
import { useQuickCart } from "../context/QuickCartContext";

export default function Crackers() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const { addItem } = useQuickCart();

  // Add both English and Kannada name to cart item
  function addItemToBag(product) {
    addItem({
      ...product,
      name: product.title,
      kn: product.titleKannada,
    }, 1);
  }

  React.useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/products?category=crackers`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        // Filter products to only those with category 'crackers'
        const filtered = Array.isArray(data)
          ? data.filter(
              (p) =>
                (p.category && p.category.toLowerCase() === "crackers") ||
                (p.Category && p.Category.name && p.Category.name.toLowerCase() === "crackers")
            )
          : [];
        setProducts(filtered);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 8, color: "#C8102E" }}>
          🎆 RRNAGAR Crackers
        </h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Select your preferred crackers. 🚚 Delivery in 7–15 days.
        </p>
        {loading && <div>Loading…</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && products.length === 0 && <div>No products found</div>}
        {!loading && !error && products.length > 0 && (
          <div>
            {(() => {
              // Group products by variety
              const grouped = {};
              products.forEach((p) => {
                const v = p.variety || 'Other';
                if (!grouped[v]) grouped[v] = [];
                grouped[v].push(p);
              });
              return Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([variety, items]) => (
                  <div key={variety} style={{ marginBottom: 32, background: '#FFF9C4', borderRadius: 12, padding: 12 }}>
                    <h2 style={{ borderBottom: '2px solid #C8102E', paddingBottom: 6, color: '#C8102E', fontSize: 20, textAlign: 'center' }}>{variety}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16, marginTop: 16 }}>
                      {items
                        .slice()
                        .sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""))
                        .map((product) => (
                          <ProductCard
                            key={product.id}
                            product={{
                              id: product.id,
                              name: product.title,
                              kn: product.titleKannada,
                              price: product.price,
                              emoji: crackerInfo[product.title]?.emoji,
                              knDisplay: crackerInfo[product.title]?.kn || product.titleKannada,
                              image: product.image,
                            }}
                            onClick={() => addItemToBag(product)}
                          />
                        ))}
                    </div>
                  </div>
                ));
            })()}
          </div>
        )}
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
