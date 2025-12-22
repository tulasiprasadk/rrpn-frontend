// frontend/src/pages/Home.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { API_BASE } from "../api/client";
import "./Home.css";

import ExploreItem from "../components/ExploreItem";
import DiscoverPopup from "../components/DiscoverPopup";
import MegaAd from "../components/MegaAd";
import AdScroll from "../components/AdScroll";

/* ================= HERO IMAGES ================= */
import hero1 from "../assets/hero-1.jpg";
import hero2 from "../assets/hero-2.jpg";
import hero3 from "../assets/hero-3.jpg";

/* ================= FALLBACK CATEGORIES ================= */
const defaultCategories = [
  { id: 22, name: "Groceries", icon: "🛒", kannada: "ದಿನಸಿ ವಸ್ತುಗಳು" },
  { id: 29, name: "Flowers", icon: "🌸", kannada: "ಹೂವುಗಳು" },
  { id: 27, name: "Crackers", icon: "🎆", kannada: "ಪಟಾಕಿಗಳು" },
  { id: 28, name: "Pet services", icon: "🐾", kannada: "ಪಶು ಸೇವೆಗಳು" },
  { id: 24, name: "Local Services", icon: "🛠️", kannada: "ಸ್ಥಳೀಯ ಸೇವೆಗಳು" },
  { id: 25, name: "Consultancy", icon: "📑", kannada: "ಸಲಹಾ ಸೇವೆಗಳು" },

];

export default function Home() {
  const navigate = useNavigate();

  /* ================= HERO ================= */
  const heroImages = [hero1, hero2, hero3];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  /* ================= STATE ================= */
  const [categories, setCategories] = useState(defaultCategories);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ DISCOVER POPUP STATE (ONLY ONCE)
  const [selectedDiscover, setSelectedDiscover] = useState(null);
  const [popupAnchor, setPopupAnchor] = useState(null);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE}/categories`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length) {
          setCategories(res.data);
        }
      })
      .catch(() => {
        setCategories(defaultCategories);
      });
  }, []);

  function handleSearchClick() {

    setHasSearched(true);
    if (!searchQuery.trim()) {
      setFilteredProducts(products.slice(0, 12));
    } else {
      const q = searchQuery.trim().toLowerCase();
      if (["flowers", "flower", "ಹೂವುಗಳು", "ಹೂವು"].includes(q)) {
        navigate("/flowers");
      } else if (["crackers", "cracker", "ಪಟಾಕಿಗಳು", "ಪಟಾಕಿ"].includes(q)) {
        navigate("/crackers");
      } else if (["groceries", "grocery", "ಕಿರಾಣಿ", "ಕಿರಾಣಿ ವಸ್ತುಗಳು"].includes(q)) {
        navigate("/groceries");
      } else if (["pet services", "pet", "pets", "ಪೆಟ್", "ಪೆಟ್ ಸೇವೆ"].includes(q)) {
        navigate("/petservices");
      } else if (["local services", "local", "services", "ಸ್ಥಳೀಯ", "ಸ್ಥಳೀಯ ಸೇವೆಗಳು"].includes(q)) {
        navigate("/localservices");
      } else if (["consultancy", "consultant", "consulting", "ಸಲಹಾ", "ಸಲಹಾ ಸೇವೆಗಳು"].includes(q)) {
        navigate("/consultancy");
      } else {
        navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
      }
    }
// ...existing code...
    if (!searchQuery.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
// ...existing code...
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") handleSearchClick();
  }



  /* 🔑 ONLY MODIFIED FUNCTION */
  function handleCategoryClick(id) {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    const name = category.name?.toLowerCase() || "";
    if (name.includes("flower")) {
      navigate("/flowers");
      return;
    }
    if (name.includes("cracker")) {
      navigate("/crackers");
      return;
    }
    if (name.includes("groceries")) {
      navigate("/groceries");
      return;
    }
    if (name.includes("grocery")) {
      navigate("/groceries");
      return;
    }
    if (name.includes("pet")) {
      navigate("/petservices");
      return;
    }
    if (name.includes("local")) {
      navigate("/localservices");
      return;
    }
    if (name.includes("consult")) {
      navigate("/consultancy");
      return;
    }
    navigate(`/browse?category=${id}`);
  }


  // MAIN RENDER
  return (
    <>
      <main style={{ display: "flex", alignItems: "flex-start" }}>
        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* HERO */}
          <section className="hero">
            <img src={heroImages[heroIndex]} alt="RR Nagar" />
            <div className="hero-text">
              <h1>ನಮ್ಮಿಂದ ನಿಮಗೆ — ನಿಮ್ಮಷ್ಟೇ ಹತ್ತಿರ</h1>
              <p>Shop local. Support local.</p>
              <div className="hero-search">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search groceries, flowers, services…"
                />
                <button onClick={handleSearchClick}>Search</button>
              </div>
            </div>
          </section>

          {/* CATEGORIES GRID */}
          <section className="section">
            <h2>Popular Categories</h2>
            <div className="cat-row">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="cat-card"
                  onClick={() => navigate(`/browse?category=${cat.id}`)}
                >
                  <div className="cat-icon">{cat.icon || "🛍️"}</div>
                  <div className="cat-name">{cat.name}</div>
                </div>
              ))}
            </div>
          </section>

          <AdScroll />

          {/* DISCOVER */}
          <section className="section">
            <h2>Discover Around You</h2>
            <div className="discover-scroll">
              <div className="discover-track">
                {[1, 2].map((_, i) => {
                  // Refs for each card
                  const ref1 = useRef();
                  const ref2 = useRef();
                  const ref3 = useRef();
                  return (
                    <React.Fragment key={i}>
                      <ExploreItem
                        icon="🛕"
                        title="Temples"
                        titleKannada="ದೇವಾಲಯಗಳು"
                        ref={ref1}
                        onClick={e => {
                          setSelectedDiscover({
                            icon: "🛕",
                            title: "Temples",
                            titleKannada: "ದೇವಾಲಯಗಳು",
                            longInfo:
                              "Temples in RR Nagar are peaceful places for worship, festivals, and community gatherings.",
                            longInfoKannada:
                              "ದೇವಾಲಯಗಳು ಪೂಜೆ, ಹಬ್ಬ ಮತ್ತು ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಪ್ರಸಿದ್ಧ.",
                          });
                          setPopupAnchor(ref1);
                        }}
                      />
                      <ExploreItem
                        icon="🌳"
                        title="Parks"
                        titleKannada="ಉದ್ಯಾನಗಳು"
                        ref={ref2}
                        onClick={e => {
                          setSelectedDiscover({
                            icon: "🌳",
                            title: "Parks",
                            titleKannada: "ಉದ್ಯಾನಗಳು",
                            longInfo:
                              "RR Nagar parks are green spaces for walks, play, relaxation, and community events.",
                            longInfoKannada:
                              "ಉದ್ಯಾನಗಳು ವಿಶ್ರಾಂತಿ, ಆಟ ಮತ್ತು ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ.",
                          });
                          setPopupAnchor(ref2);
                        }}
                      />
                      <ExploreItem
                        icon="💻"
                        title="IT Park"
                        titleKannada="ಐಟಿ ಪಾರ್ಕ್"
                        ref={ref3}
                        onClick={e => {
                          setSelectedDiscover({
                            icon: "💻",
                            title: "IT Park",
                            titleKannada: "ಐಟಿ ಪಾರ್ಕ್",
                            longInfo:
                              "IT Park in RR Nagar has tech companies, startups, and innovation.",
                            longInfoKannada:
                              "ಐಟಿ ಪಾರ್ಕ್ ಉದ್ಯೋಗ ಮತ್ತು ಹೊಸ ಆವಿಷ್ಕಾರಗಳಿಗೆ.",
                          });
                          setPopupAnchor(ref3);
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </section>

          {/* PRODUCTS */}
          <section className="section">
            <h2 className="section-title">Fresh Picks for You</h2>
            <div className="products-grid">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image || "/images/product-placeholder.png"}
                    alt={product.title}
                    loading="lazy"
                  />
                  <h3>{product.title}</h3>
                  <p>₹{product.price}</p>
                  <button
                    disabled={addingToCart === product.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    {addingToCart === product.id ? "Adding…" : "Add to cart"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside style={{ marginLeft: 24 }}>
          <MegaAd image="/ads/mega-right.png" position="right" />
        </aside>
      </main>

      {/* ✅ DISCOVER POPUP */}
      <DiscoverPopup
        item={selectedDiscover}
        anchorRef={popupAnchor}
        onClose={() => {
          setSelectedDiscover(null);
          setPopupAnchor(null);
        }}
      />
    </>
  );
}
