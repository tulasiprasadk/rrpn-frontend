import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../../config/api";
// ...existing code...
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [selectedSubVariety, setSelectedSubVariety] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===============================
     Fetch Product (PUBLIC)
  =============================== */
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load product");
          setProduct(null);
          setLoading(false);
          return;
        }
        setProduct(data);
        // Preselect first variety if present
        if (data.varieties?.length > 0) {
          setSelectedVariety(data.varieties[0]);
        } else {
          setSelectedVariety(null);
        }
      } catch (err) {
        console.error(err);
        setError("Server error while loading product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  /* ===============================
     Add to Bag (FRONTEND ONLY)
     Matches rrnagar.com
  =============================== */
  const handleAddToBag = async () => {
    if (!product) {
      alert("Product not loaded yet");
      return;
    }
    if (product.varieties?.length > 0 && !selectedVariety) {
      alert("Please select a variety");
      return;
    }
    // Always send productId, quantity, and category
    const payload = {
      productId: product.id,
      quantity,
      category: product.category || product.Category || '',
      varietyId: selectedVariety?.id,
      subVarietyId: selectedSubVariety?.id,
    };
    try {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        alert("Unexpected server response. Please try again.");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data?.error || "Error adding to bag");
        return;
      }
      window.dispatchEvent(new Event("cart-updated"));
      alert("Added to bag!");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* ===============================
     UI STATES
  =============================== */
  if (loading) {
    return (
      <div className="pd-container">
        <div className="pd-skeleton" />
      </div>
    );
  }
  if (error) {
    return <div className="pd-error">{error}</div>;
  }
  if (!product) {
    return <div className="pd-error">Product not found</div>;
  }

  /* ===============================
     RENDER
  =============================== */
  // Fallbacks for missing fields
  const title = product.title || product.name || 'Untitled Product';
  const image = product.image || product.imageUrl || (product.images?.[0]) || '/no-image.png';
  const price = selectedVariety?.price ?? product.price ?? product.basePrice ?? 0;
  const description = product.description || 'No description available.';
  const category = product.category || product.Category || '';

  return (
    <div className="pd-container">
      {/* IMAGE */}
      <div className="pd-images">
        <img
          src={image}
          alt={title}
          className="pd-main-img"
          onError={e => { e.target.src = '/no-image.png'; }}
        />
      </div>

      {/* DETAILS */}
      <div className="pd-info">
        <h1 className="pd-title">{title}</h1>
        <div className="pd-category">{category && <span>Category: {category}</span>}</div>
        <p className="pd-description">{description}</p>
        {/* PRICE */}
        <div className="pd-price">
          ₹ {price > 0 ? price.toFixed(2) : '—'}
        </div>
        {/* VARIETIES */}
        {product.varieties?.length > 0 && (
          <div className="pd-section">
            <h4>Choose Variety</h4>
            <div className="pd-varieties">
              {product.varieties.map((v) => (
                <button
                  key={v.id}
                  className={`pd-var-btn ${selectedVariety?.id === v.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedVariety(v);
                    setSelectedSubVariety(null);
                  }}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* SUB VARIETIES */}
        {selectedVariety?.subVarieties?.length > 0 && (
          <div className="pd-section">
            <h4>Select Option</h4>
            <div className="pd-varieties">
              {selectedVariety.subVarieties.map((sv) => (
                <button
                  key={sv.id}
                  className={`pd-var-btn ${selectedSubVariety?.id === sv.id ? "active" : ""}`}
                  onClick={() => setSelectedSubVariety(sv)}
                >
                  {sv.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* QUANTITY */}
        <div className="pd-qty">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>
        {/* ADD TO BAG */}
        <button className="pd-add-btn" onClick={handleAddToBag}>
          Add to bag
        </button>
      </div>
    </div>
  );
}
