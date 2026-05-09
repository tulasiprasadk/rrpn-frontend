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

function normalizeVariety(value) {
  return (value || "Other").toString().trim() || "Other";
}

function cleanTitle(product) {
  const rawTitle = (product.title || "").trim();
  if (!rawTitle) return "Product";
  const [name] = rawTitle.split(" - ");
  return (name || rawTitle).trim();
}

export default function Crackers() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedVariety, setSelectedVariety] = React.useState("All");
  const [isCompactLayout, setIsCompactLayout] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 1180 : false
  );
  const { addItem } = useCrackerCart();

  // Add both English and Kannada name to cart item
  function addItemToBag(product) {
    addItem(
      {
        ...product,
        name: product.title,
        kn: product.titleKannada,
      },
      1
    );
  }

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsCompactLayout(window.innerWidth < 1180);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setError("");
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Resolve category id for "Crackers" dynamically (case-insensitive)
        const catsRes = await fetch(`${API_BASE}/categories`, { credentials: "include" });
        if (!catsRes.ok) throw new Error("Failed to load categories");
        const catsData = await catsRes.json();
        const cats = catsData && catsData.value ? catsData.value : catsData || [];
        const crackerCat = cats.find((c) => c.name && c.name.toLowerCase() === "crackers");
        const catId = crackerCat ? crackerCat.id : null;

        const data = await getProducts("", catId || "");
        if (!mounted) return;
        // backend may still return extra categories; ensure only crackers shown
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.Category && p.Category.name && p.Category.name.toLowerCase() === "crackers")
          : [];
        setProducts(filtered);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  const preparedProducts = React.useMemo(
    () =>
      products.map((product) => ({
        ...product,
        title: cleanTitle(product),
        displayVariety: normalizeVariety(product.variety),
      })),
    [products]
  );

  const varietyCounts = React.useMemo(() => {
    const counts = new Map();
    preparedProducts.forEach((product) => {
      const key = product.displayVariety;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));
  }, [preparedProducts]);

  const filteredProducts = React.useMemo(() => {
    const list =
      selectedVariety === "All" ? preparedProducts : preparedProducts.filter((p) => p.displayVariety === selectedVariety);
    return list.slice().sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [preparedProducts, selectedVariety]);

  const selectedCount = selectedVariety === "All" ? preparedProducts.length : filteredProducts.length;

  const varietySelector = (
    <div style={{ display: isCompactLayout ? "flex" : "grid", gap: 8, overflowX: isCompactLayout ? "auto" : "visible", paddingBottom: isCompactLayout ? 4 : 0 }}>
      <button
        type="button"
        onClick={() => setSelectedVariety("All")}
        style={{
          flex: isCompactLayout ? "0 0 auto" : undefined,
          minWidth: isCompactLayout ? 140 : undefined,
          border: selectedVariety === "All" ? "2px solid #C8102E" : "1px solid #E6D36A",
          background: selectedVariety === "All" ? "#fff" : "#FFFDF0",
          color: "#5A3A00",
          borderRadius: 12,
          padding: "10px 12px",
          textAlign: "left",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        All Varieties
        <div style={{ fontSize: 12, color: "#8b5e00", marginTop: 4 }}>{preparedProducts.length} items</div>
      </button>
      {varietyCounts.map((v) => (
        <button
          key={v.name}
          type="button"
          onClick={() => setSelectedVariety(v.name)}
          style={{
            flex: isCompactLayout ? "0 0 auto" : undefined,
            minWidth: isCompactLayout ? 140 : undefined,
            border: selectedVariety === v.name ? "2px solid #C8102E" : "1px solid #E6D36A",
            background: selectedVariety === v.name ? "#fff" : "#FFFDF0",
            color: "#5A3A00",
            borderRadius: 12,
            padding: "10px 12px",
            textAlign: "left",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {v.name}
          <div style={{ fontSize: 12, color: "#8b5e00", marginTop: 4 }}>{v.count} items</div>
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="with-cart-panel"
      style={{
        minHeight: "100vh",
        background: "#FFFDE7",
        display: isCompactLayout ? "flex" : "grid",
        gridTemplateColumns: isCompactLayout ? undefined : "160px minmax(0, 1fr) 320px",
        alignItems: "flex-start",
        gap: isCompactLayout ? 16 : 18,
        flexDirection: isCompactLayout ? "column" : undefined,
        padding: isCompactLayout ? "16px 12px 24px" : "0 16px",
      }}
    >
      {!isCompactLayout && (
        <aside style={{ width: 160, minWidth: 160, position: "sticky", top: 24, alignSelf: "flex-start", background: "#FFF9C4", border: "1px solid #F2D060", borderRadius: 16, padding: 16, maxHeight: "calc(100vh - 48px)", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#C8102E", fontWeight: 800, marginBottom: 12 }}>
            <CategoryIcon category="crackers" size={18} />
            Variety View
          </div>
          {varietySelector}
        </aside>
      )}

      <div style={{ minWidth: 0, width: "100%", padding: isCompactLayout ? 0 : "24px 0" }}>
        <div style={{ background: "#FFF9C4", borderRadius: 16, padding: "18px 20px", border: "1px solid #F2D060", marginBottom: 20 }}>
          <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, color: "#C8102E" }}>
            <CategoryIcon category="crackers" size={22} /> RRNAGAR Crackers
          </h1>
          <p style={{ margin: "8px 0 0", color: "#7a2034", fontWeight: 700 }}>Select your preferred crackers. 🚚 Delivery in 7–15 days.</p>
          <div style={{ marginTop: 10, color: "#5A3A00", fontWeight: 700 }}>{selectedVariety === "All" ? `Showing ${preparedProducts.length} crackers` : `Showing ${selectedCount} products in ${selectedVariety}`}</div>
        </div>

        {isCompactLayout && (
          <div style={{ background: "#FFF9C4", borderRadius: 16, padding: 12, border: "1px solid #F2D060", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#C8102E", fontWeight: 800, marginBottom: 10 }}>
              <CategoryIcon category="crackers" size={18} />
              Browse By Variety
            </div>
            {varietySelector}
          </div>
        )}

        {loading && <div>Loading…</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && preparedProducts.length === 0 && <div>No products found</div>}

        {!loading && !error && preparedProducts.length > 0 && (
          <div className="product-grid" style={{ display: "grid", gridTemplateColumns: isCompactLayout ? "repeat(auto-fill, minmax(140px, 1fr))" : "repeat(auto-fill, minmax(150px, 1fr))", gap: isCompactLayout ? 14 : 18 }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ minWidth: 0, display: "flex" }}>
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.title,
                    kn: product.titleKannada,
                    price: product.price,
                    image: product.image,
                    variety: product.displayVariety,
                  }}
                  iconSize={16}
                  onClick={() => addItemToBag(product)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: isCompactLayout ? "100%" : 320, minWidth: isCompactLayout ? 0 : 320, maxWidth: isCompactLayout ? "100%" : 320, position: isCompactLayout ? "static" : "sticky", top: 24, alignSelf: "flex-start" }}>
        <CartPanel orderType="CRACKERS" />
      </div>
    </div>
  );
}



