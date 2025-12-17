import crackers from "../data/crackers.json";
import CrackerCard from "../components/CrackerCard";
import CartPanel from "../components/CartPanel";
import { CrackerCartProvider } from "../context/CrackerCartContext";

export default function Crackers() {
  return (
    <CrackerCartProvider>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#FFF8E1" // soft yellow background (site-friendly)
        }}
      >
        {/* LEFT: PRODUCTS */}
        <div style={{ flex: 1, padding: "24px 32px" }}>
          <h1
            style={{
              marginBottom: 8,
              color: "#C8102E" // Karnataka red
            }}
          >
            🎆 RRNAGAR Crackers
          </h1>

          <p style={{ color: "#555", marginBottom: 24 }}>
            Select your preferred crackers. 🚚 Delivery in 7–15 days.
          </p>

          {crackers.map((cat) => (
            <div key={cat.category} style={{ marginBottom: 32 }}>
              <h2
                style={{
                  borderBottom: "2px solid #C8102E",
                  paddingBottom: 6,
                  color: "#333"
                }}
              >
                {cat.category}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 16,
                  marginTop: 16
                }}
              >
                {cat.products.map((product) => (
                  <CrackerCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: CART */}
        <CartPanel />
      </div>
    </CrackerCartProvider>
  );
}
