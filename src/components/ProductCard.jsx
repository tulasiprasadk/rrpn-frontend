import React from "react";
import { useQuickCart } from "../context/QuickCartContext";


// Unified emoji mapping for all categories
const unifiedEmojiMap = {
  FRUITS: "🍎",
  VEGETABLES: "🥦",
  LEAFY: "🥬",
  BAKERY: "🍞",
  MILK: "🥛",
  DAIRY: "🥛",
  STAPLES: "🍚",
  CRACKERS: "🎆",
  FLOWERS: "🌸",
  OTHERS: "🛒",
};

export default function ProductCard({ product, onClick }) {
  const { addItem } = useQuickCart();
  if (!product) return null;
  const {
    id,
    name,
    title,
    kn,
    knDisplay,
    emoji,
    titleKannada,
    price,
    image,
    imageUrl,
    image_url,
    description,
    variety,
    category,
  } = product;
  const displayName = name || title || "Product";
  const displayImage = image || imageUrl || image_url || "";
  const displayPrice = typeof price === "number" ? price : null;
  const displayKn = knDisplay || kn || titleKannada;
  // Unified emoji logic for all categories
  function getUnifiedEmoji() {
    if (emoji) return emoji;
    if (variety && unifiedEmojiMap[variety.toUpperCase()]) return unifiedEmojiMap[variety.toUpperCase()];
    if (category && unifiedEmojiMap[category.toUpperCase()]) return unifiedEmojiMap[category.toUpperCase()];
    return unifiedEmojiMap.OTHERS;
  }
  const displayEmoji = getUnifiedEmoji();

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      addItem(product, 1);
    }
  };
  return (
    <div
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 10,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        aspectRatio: '1 / 1',
        padding: 0,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* IMAGE + EMOJI */}
      <div
        style={{
          width: "100%",
          aspectRatio: '1 / 1',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          overflow: "hidden",
          background: "#f6f6f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Always show emoji as badge if present */}
            <span style={{
              position: "absolute",
              top: 8,
              left: 8,
              fontSize: 20,
              filter: "drop-shadow(0 1px 2px #fff)",
              color: "#c8102e",
              lineHeight: 1
            }}>{displayEmoji}</span>
          </>
        ) : (
          // Show emoji large if no image
          <span style={{ fontSize: 36, color: "#c8102e", lineHeight: 1 }}>{displayEmoji}</span>
        )}
      </div>

      {/* NAME */}
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#c8102e", textAlign: 'center' }}>
        {displayName}
      </h3>

      {/* KANNADA NAME */}
      {displayKn && (
        <div style={{ color: "#c8102e", fontSize: 16, fontFamily: 'Noto Sans Kannada, Tunga, Arial, sans-serif', fontWeight: 600, textAlign: 'center' }}>
          {displayKn}
        </div>
      )}

      {/* DESCRIPTION */}
      {description && (
        <p style={{ margin: 0, fontSize: 13, color: "#c8102e", textAlign: 'center' }}>
          {description}
        </p>
      )}

      {/* PRICE */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 16,
          fontWeight: 700,
          color: "#c8102e",
          textAlign: 'center',
          width: '100%'
        }}
      >
        {displayPrice !== null ? `₹${displayPrice}` : "—"}
      </div>
    </div>
  );
}
