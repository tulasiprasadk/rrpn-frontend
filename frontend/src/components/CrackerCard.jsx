import { useCrackerCart } from "../context/CrackerCartContext";

export default function CrackerCard({ product }) {
  const { addItem } = useCrackerCart();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => addItem(product)}
      onKeyDown={(e) => e.key === "Enter" && addItem(product)}
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 10,
        padding: 14,
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        cursor: "pointer"
      }}
    >
      <h4 style={{ marginBottom: 6 }}>{product.name}</h4>
      <p style={{ color: "#444", marginBottom: 12 }}>
        ₹ {product.price} / {product.unit}
      </p>
    </div>
  );
}



