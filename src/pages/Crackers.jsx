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
import React from "react";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import { API_BASE } from "../config/api";
import CartPanel from "../components/CartPanel";
import { getProducts } from "../api";
import { useCrackerCart } from "../context/CrackerCartContext";

export default function Crackers() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const { addItem } = useCrackerCart();

  // Add both English and Kannada name to cart item
  function addItemToBag(product) {
    // Ensure price is included
    const productWithPrice = {
      ...product,
      name: product.title,
      title: product.title,
      kn: product.titleKannada,
      price: Number(product.price || product.amount || product.basePrice || 0)
    };
    
    console.log('Crackers: Adding product to bag:', productWithPrice);
    addItem(productWithPrice, 1);
    
    // Dispatch event to ensure CartPanel updates
    window.dispatchEvent(new Event('cart-updated'));
    
    // Show feedback
    alert(`✓ ${product.title} added to bag!`);
  }

  React.useEffect(() => {
    setLoading(true);
    setError("");
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Resolve category id for "Crackers" dynamically (case-insensitive)
        const catsRes = await fetch(`${API_BASE}/categories`, { credentials: 'include' });
        if (!catsRes.ok) throw new Error('Failed to load categories');
        const catsData = await catsRes.json();
        const cats = catsData && catsData.value ? catsData.value : catsData || [];
        const crackerCat = cats.find(c => c.name && c.name.toLowerCase() === 'crackers');
        const catId = crackerCat ? crackerCat.id : null;

        const data = await getProducts("", catId || "");
        if (!mounted) return;
        // backend may still return extra categories; ensure only crackers shown
        const filtered = Array.isArray(data)
          ? data.filter(
              (p) => (p.Category && p.Category.name && p.Category.name.toLowerCase() === "crackers")
            )
          : [];
        setProducts(filtered);
      } catch (err) { console.error(err);
        if (mounted) setError("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 8, color: "#C8102E", display: 'flex', alignItems: 'center', gap: 8 }}>
          <CategoryIcon category="crackers" size={20} /> RRNAGAR Crackers
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
                              knDisplay: crackerInfo[product.title]?.kn || product.titleKannada,
                              image: product.image,
                              variety: product.variety || product.title,
                            }}
                             iconSize={18}
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



