import React, { useEffect, useState } from "react";
import CategoryIcon from "./CategoryIcon";
import CartPanel from "./CartPanel";

export default function CategoryLayout({
  title,
  category,
  left,
  children,
  orderType,
}) {
  const [isCompactLayout, setIsCompactLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1180 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsCompactLayout(window.innerWidth < 1180);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
        <aside
          style={{
            width: 160,
            minWidth: 160,
            position: "sticky",
            top: 24,
            alignSelf: "flex-start",
            background: "#FFF9C4",
            border: "1px solid #F2D060",
            borderRadius: 16,
            padding: 16,
            maxHeight: "calc(100vh - 48px)",
            overflow: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#C8102E", fontWeight: 800, marginBottom: 12 }}>
            <CategoryIcon category={category} size={18} />
            {title || "Browse"}
          </div>
          {left}
        </aside>
      )}

      <div style={{ minWidth: 0, width: "100%", padding: isCompactLayout ? 0 : "24px 0" }}>
        {title && (
          <div
            style={{
              background: "#FFF9C4",
              borderRadius: 16,
              padding: "18px 20px",
              border: "1px solid #F2D060",
              marginBottom: 20,
            }}
          >
            <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, color: "#C8102E" }}>
              <CategoryIcon category={category} size={22} />
              {title}
            </h1>
          </div>
        )}

        {children}
      </div>

      <div
        style={{
          width: isCompactLayout ? "100%" : 320,
          minWidth: isCompactLayout ? 0 : 320,
          maxWidth: isCompactLayout ? "100%" : 320,
          position: isCompactLayout ? "static" : "sticky",
          top: 24,
          alignSelf: "flex-start",
        }}
      >
        <CartPanel orderType={orderType} />
      </div>
    </div>
  );
}
