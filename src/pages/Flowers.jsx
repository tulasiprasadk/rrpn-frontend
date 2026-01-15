// src/pages/Flowers.jsx

import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../api";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import CartPanel from "../components/CartPanel";

// Emoji mapping handled by `CategoryIcon`; removed unused local map

export default function Flowers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Resolve Flowers category id dynamically via helper
        const cats = await getCategories();
        const flowerCat = cats.find(c => c.name && c.name.toLowerCase() === 'flowers');
        const catId = flowerCat ? flowerCat.id : null;

        const data = await getProducts("", catId || "");
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      } catch {
        console.error(e);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  // Group products by VARIETY (prefer `p.variety` if present), default to 'Others'
  const grouped = products.reduce((acc, p) => {
    let name = (p.title || '').trim();
    let variety = p.variety ? p.variety : null;

    if (!variety) {
      const parts = (p.title || '').split(' - ');
      name = parts[0] ? parts[0].trim() : p.title;
      variety = parts[1] ? parts[1].trim() : 'Others';
    }

    // Pick emoji based on flower name (case-insensitive) — icon rendering moved to centralized component

    if (!acc[variety]) acc[variety] = [];
    acc[variety].push({
      ...p,
      title: name, // cleaned title for ProductCard
    });
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CategoryIcon category="flowers" size={20} /> Flowers
        </h1>

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
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 20,
                    marginTop: 16,
                    alignItems: "stretch"
                  }}
                >
                  {items
                    .slice()
                    .sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""))
                        .map(product => (
                      <div style={{ minWidth: 0, display: 'flex' }} key={product.id}>
                        <ProductCard
                          product={product}
                          iconSize={16}
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



