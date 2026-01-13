import React from "react";
import { useCrackerCart } from "../context/CrackerCartContext";
import CategoryIcon from "./CategoryIcon";


// Emoji mapping consolidated in `CategoryIcon` — removed local unused map

export default function ProductCard({ product, onClick, variant, iconSize }) {
  const { addItem } = useCrackerCart();
  if (!product) return null;
  const {
    id: _id,
    name,
    title,
    kn,
    knDisplay,
    emoji: _emoji,
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
  // ensure title/desc wrappers have no unexpected border/background
  const titleStyle = { margin: 0, fontSize: 12, fontWeight: 600, color: "#b00018", textAlign: 'center', background: 'transparent', border: 'none' };
  const knStyle = { color: "#b00018", fontSize: 11, fontFamily: 'Noto Sans Kannada, Tunga, Arial, sans-serif', fontWeight: 600, textAlign: 'center', background: 'transparent', border: 'none' };
  const displayPrice = typeof price === "number" ? price : null;
  const displayKn = knDisplay || kn || titleKannada;
  // Keep backward-compatibility: emoji prop still considered, otherwise use category/variety
  // emoji helper removed — centralized emoji rendering via `CategoryIcon`

  const handleClick = async () => {
    if (onClick) {
      onClick(product);
    } else {
      // Add to bag directly
      console.log('Adding product to bag:', product);
      
      // Check if product has a valid price
      const currentPrice = Number(product.price || product.amount || product.basePrice || product.Price || 0);
      
      // If product doesn't have a valid price, fetch it from API
      let productWithPrice = product;
      if (currentPrice <= 0 && product.id) {
        try {
          console.log('Product missing price, fetching from API for product ID:', product.id);
          const { API_BASE } = await import('../config/api');
          const res = await fetch(`${API_BASE}/products/${product.id}`, {
            credentials: 'include'
          });
          if (res.ok) {
            const fullProduct = await res.json();
            const fetchedPrice = Number(fullProduct.price || fullProduct.basePrice || fullProduct.amount || 0);
            productWithPrice = {
              ...product,
              price: fetchedPrice,
              basePrice: fetchedPrice,
              amount: fetchedPrice
            };
            console.log('✅ Fetched product price from API:', fetchedPrice);
          } else {
            console.warn('Failed to fetch product details, status:', res.status);
          }
        } catch (err) {
          console.error('Failed to fetch product price:', err);
        }
      }
      
      // Validate price before adding
      const finalPrice = Number(productWithPrice.price || productWithPrice.amount || productWithPrice.basePrice || productWithPrice.Price || 0);
      if (finalPrice <= 0) {
        const productName = productWithPrice.title || productWithPrice.name || 'This product';
        alert(`⚠️ ${productName} doesn't have a price set.\n\nPlease contact support or try another product.`);
        return;
      }
      
      // Ensure price is included in the product object
      const productToAdd = {
        ...productWithPrice,
        price: finalPrice
      };
      
      addItem(productToAdd, 1);
      
      // Dispatch events immediately as backup (context also dispatches, but this ensures it)
      // Dispatch immediately
      window.dispatchEvent(new Event('cart-updated'));
      
      // Also dispatch after a short delay to ensure it's caught
      setTimeout(() => {
        window.dispatchEvent(new Event('cart-updated'));
        // Also try to read from localStorage and dispatch with data
        try {
          const saved = JSON.parse(localStorage.getItem('bag') || '[]');
          window.dispatchEvent(new CustomEvent('cart-updated-with-data', { 
            detail: { cart: saved } 
          }));
        } catch (err) {
          console.error('ProductCard: Error reading localStorage for event:', err);
        }
      }, 100);
      
      // Show feedback
      const productName = productToAdd.title || productToAdd.name || 'Product';
      alert(`✓ ${productName} added to bag!`);
    }
  };
  const baseStyle = {
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
    width: '100%',
    height: '100%',
    minHeight: '200px',
    maxHeight: '250px',
  };

  const freshOverrides = {
    border: '1px solid rgba(0,255,198,0.12)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.94))',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    borderRadius: 12,
    padding: 8
  };

  const mergedStyle = variant === 'fresh' ? { ...baseStyle, ...freshOverrides } : baseStyle;

  return (
    <div
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={mergedStyle}
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
              top: 6,
              left: 6,
              width: (iconSize || 18) + 2,
              height: (iconSize || 18) + 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CategoryIcon name={displayName} category={category} variety={variety} size={iconSize || 16} />
            </span>
          </>
        ) : (
          // Show icon large if no image
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryIcon name={displayName} category={category} variety={variety} size={iconSize ? Math.max(20, iconSize*1.6) : 28} />
          </div>
        )}
      </div>

      {/* NAME */}
      <h3 style={titleStyle}>{displayName}</h3>

      {/* KANNADA NAME */}
      {displayKn && (
        <div style={knStyle}>{displayKn}</div>
      )}

      {/* DESCRIPTION */}
      {description && (
        <p style={{ margin: 0, fontSize: 10, color: "#c8102e", textAlign: 'center' }}>
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
          fontSize: 12,
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



