// src/pages/Groceries.jsx


import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../api";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import CartPanel from "../components/CartPanel";

// Emoji mapping is handled by `CategoryIcon`; removed unused local map

export default function Groceries() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Resolve Groceries category id and fetch only that category's products
        const cats = await getCategories();
        const groceriesCat = cats.find(c => (c.name || '').toLowerCase().includes('groc'));
        if (groceriesCat && groceriesCat.id) {
          const data = await getProducts("", groceriesCat.id);

          if (Array.isArray(data) && data.length > 0) {
            if (mounted) setProducts(data || []);
          } else {
            // fallback: fetch all and filter by Category name
            const allData = await getProducts();
            let groceries = (allData || []).filter(
              (p) => p.Category && (p.Category.name || "").toLowerCase().includes("groc")
            );
            // If still empty, show all products to avoid blank page
            if (groceries.length === 0) {
              groceries = allData || [];
            }
            if (mounted) setProducts(groceries);
          }
        } else {
          // fallback: fetch all and filter by Category name
          const data = await getProducts();
          let groceries = (data || []).filter(
            (p) => p.Category && (p.Category.name || "").toLowerCase().includes("groc")
          );
          if (groceries.length === 0) {
            groceries = data || [];
          }
          if (mounted) setProducts(groceries);
        }
      } catch (e) {
        console.error('Groceries page - load error:', e);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

    // Group by BUSINESS GROUP (Fruits, Vegetables, etc.), then by VARIETY (prefer product.variety)
    const groupedProducts = products.reduce((acc, product) => {
      const groupKey = product.group || "Others";
      let name = (product.title || '').trim();
      let variety = product.variety || null;

      if (!variety) {
        const parts = (product.title || '').split(' - ');
        name = parts[0] ? parts[0].trim() : product.title;
        variety = parts[1] ? parts[1].trim() : 'Others';
      }

      if (!acc[groupKey]) acc[groupKey] = {};
      if (!acc[groupKey][variety]) acc[groupKey][variety] = [];
      acc[groupKey][variety].push({
        ...product,
        title: name // cleaned title for ProductCard
      });
      return acc;
    }, {});

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CategoryIcon category="groceries" size={20} /> Groceries
        </h1>
        <div style={{ color: '#C8102E', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
          Showing {products.length} products
        </div>

        {/* Debug panel removed */}
        {loading && <p>Loading...</p>}
        {!loading && products.length === 0 && <p>No groceries available</p>}
        {!loading &&
          Object.entries(groupedProducts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupKey, varieties]) => (
              // `varieties` is an object: { varietyName: [products] }
              Object.entries(varieties)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([variety, items]) => (
                  <div key={`${groupKey}-${variety}`} style={{ marginBottom: 32, background: '#FFF9C4', borderRadius: 12, padding: 12 }}>
                    <h2 style={{ borderBottom: '2px solid #C8102E', paddingBottom: 6, color: '#C8102E', fontSize: 20, textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <CategoryIcon category="groceries" variety={variety} size={16} /> {variety}
                      </span>
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 20,
                        marginTop: 16
                      }}
                    >
                      {items
                        .slice()
                        .sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""))
                        .map(product => (
                          <div style={{ minWidth: 0, display: 'flex' }} key={product.id}>
                                <ProductCard
                                  product={{ ...product }}
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
                ))
            ))}
      </div>
      <div style={{
        position: 'sticky',
        top: 32,
        alignSelf: 'flex-start',
        height: 'fit-content',
        zIndex: 10
      }}>
        <CartPanel orderType="GROCERIES" />
      </div>
    </div>
  );
}




