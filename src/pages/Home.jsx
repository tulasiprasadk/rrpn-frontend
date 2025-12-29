// Home page – hero, categories, ads, discover & products (FINAL CLEAN, LOCKED)

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Home.css";
import ExploreItem from "../components/ExploreItem";
import DiscoverPopup from "../components/DiscoverPopup";
import MegaAd from "../components/MegaAd";
import api from "../api/client";
import ProductCard from "../components/ProductCard";

/* ================= ANALYTICS (GA4) ================= */
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

function useGoogleAnalytics() {
  useEffect(() => {
    if (window.gtag) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }, []);
}

/* ================= HERO IMAGES ================= */
import hero1 from "../assets/hero-1.jpg";
import hero2 from "../assets/hero-2.jpg";
import hero3 from "../assets/hero-3.jpg";
import hero4 from "../assets/hero-4.jpg";

/* ================= ADS ================= */
import ad1 from "../assets/ads/ad1.jpg";
import ad2 from "../assets/ads/ad2.jpg";
import ad3 from "../assets/ads/ad3.jpg";
import ad4 from "../assets/ads/ad4.jpg";

/* ================= FALLBACK CATEGORIES ================= */
const defaultCategories = [
  { id: 1, name: "Flowers", nameKannada: "ಹೂವುಗಳು", icon: "🌸" },
  { id: 2, name: "Crackers", nameKannada: "ಪಟಾಕಿಗಳು", icon: "🎆" },
  { id: 3, name: "Groceries", nameKannada: "ಕಿರಾಣಿ ವಸ್ತುಗಳು", icon: "🛒" },
  { id: 4, name: "Pet Supplies", nameKannada: "ಪೆಟ್ ಸೇವೆ", icon: "🐾" },
  { id: 5, name: "Local Services", nameKannada: "ಸ್ಥಳೀಯ ಸೇವೆಗಳು", icon: "🛠️" },
  { id: 6, name: "Consultancy", nameKannada: "ಸಲಹಾ ಸೇವೆಗಳು", icon: "📑" },
];

export default function Home() {
  useGoogleAnalytics();
  const navigate = useNavigate();

  /* ================= HERO SLIDER ================= */
  const heroImages = [hero1, hero2, hero3, hero4];
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSrc, setHeroSrc] = useState(heroImages[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setHeroSrc(heroImages[heroIndex]);
  }, [heroIndex]);

  /* ================= HERO SEARCH (PURE NAVIGATION) ================= */
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchClick() {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/browse?q=${encodeURIComponent(q)}`);
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") handleSearchClick();
  }

  /* ================= PRODUCTS ================= */
  const [products, setProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await api.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setProducts([]);
      console.error("Error loading products:", err);
    }
  }

  async function addToBag(product) {
    setAddingToCart(product.id);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((i) => i.id === product.id);

      if (existing) existing.quantity += 1;
      else cart.push({ ...product, quantity: 1 });

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`✓ ${product.title} added to cart`);
    } catch {
      alert("Failed to add to bag");
    } finally {
      setAddingToCart(null);
    }
  }

  /* ================= CATEGORIES (UNCHANGED) ================= */
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await api.get("/categories");
      const data = Array.isArray(res.data) ? res.data : [];

      if (!data.length) {
        setCategories(defaultCategories);
        return;
      }

      setCategories(
        data.map((cat) => {
          const def = defaultCategories.find(
            (d) =>
              d.name.replace(/\s+/g, "").toLowerCase() ===
              (cat.name || "").replace(/\s+/g, "").toLowerCase()
          );
          return {
            ...cat,
            icon: def?.icon || cat.icon || "🛍️",
            nameKannada: def?.nameKannada || cat.nameKannada || "",
          };
        })
      );
    } catch {
      setCategories(defaultCategories);
    }
  }

  function handleCategoryClick(id) {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const name = category.name?.toLowerCase() || "";
    if (name.includes("flower")) return navigate("/flowers");
    if (name.includes("cracker")) return navigate("/crackers");
    if (name.includes("groc")) return navigate("/groceries");
    if (name.includes("pet")) return navigate("/petservices");
    if (name.includes("local")) return navigate("/localservices");
    if (name.includes("consult")) return navigate("/consultancy");

    navigate(`/browse?categoryId=${id}`);
  }

  /* ================= ADS ================= */
  const ads = [
    { image: ad1, title: "iChase Fitness", link: "https://vchase.in" },
    { image: ad2, title: "Marketing", link: "https://vchase.in" },
    { image: ad3, title: "Crackers", link: "https://rrnagar.com" },
    { image: ad4, title: "Pet Services", link: "https://thevetbuddy.com" },
  ];
  const adsLoop = [...ads, ...ads];

  /* ================= DISCOVER ================= */
  const discover = [
    { title: "Temples", titleKannada: "ದೇವಾಲಯಗಳು", desc: "Spiritual places", icon: "🛕", longInfo: "Temples are a vital part of RR Nagar's culture, offering spiritual solace and community events.", longInfoKannada: "ದೇವಾಲಯಗಳು ಆರ್ ಆರ್ ನಗರದಲ್ಲಿ ಆಧ್ಯಾತ್ಮಿಕತೆ ಮತ್ತು ಸಮುದಾಯದ ಕೇಂದ್ರಗಳಾಗಿವೆ." },
    { title: "Parks", titleKannada: "ಉದ್ಯಾನಗಳು", desc: "Green spaces", icon: "🌳", longInfo: "RR Nagar is home to several parks, perfect for morning walks, play, and relaxation.", longInfoKannada: "ಆರ್ ಆರ್ ನಗರದಲ್ಲಿ ಹಲವಾರು ಉದ್ಯಾನಗಳು ಇವೆ, ವಿಶ್ರಾಂತಿ ಮತ್ತು ಆಟಕ್ಕೆ ಸೂಕ್ತವಾದವು." },
    { title: "IT Parks", titleKannada: "ಐಟಿ ಉದ್ಯಾನಗಳು", desc: "Tech hubs", icon: "💻", longInfo: "IT Parks in RR Nagar drive innovation and provide jobs to many residents.", longInfoKannada: "ಐಟಿ ಉದ್ಯಾನಗಳು ಆರ್ ಆರ್ ನಗರದಲ್ಲಿ ಉದ್ಯೋಗ ಮತ್ತು ನವೀನತೆಗೆ ಕಾರಣವಾಗಿವೆ." },
    { title: "Education", titleKannada: "ಶಿಕ್ಷಣ", desc: "Schools & colleges", icon: "🎓", longInfo: "RR Nagar has top schools and colleges, making it a hub for quality education.", longInfoKannada: "ಆರ್ ಆರ್ ನಗರದಲ್ಲಿ ಉತ್ತಮ ಶಾಲೆಗಳು ಮತ್ತು ಕಾಲೇಜುಗಳಿವೆ." },
    { title: "Entertainment", titleKannada: "ಮನರಂಜನೆ", desc: "Fun places", icon: "🎭", longInfo: "Enjoy movies, events, and fun activities in RR Nagar's entertainment spots.", longInfoKannada: "ಆರ್ ಆರ್ ನಗರದಲ್ಲಿ ಮನರಂಜನೆಗೆ ಹಲವಾರು ಅವಕಾಶಗಳಿವೆ." },
  ];
  // Discover popup state
  const [popup, setPopup] = useState({ open: false, item: null, anchor: null });
  const discoverItemRefs = useRef([]);

  const discoverRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    if (!discoverRef.current) return;
    const calcWidth = () => {
      let total = 0;
      discoverRef.current.querySelectorAll(".discover-item").forEach((item) => {
        const style = window.getComputedStyle(item);
        total += item.offsetWidth + parseFloat(style.marginRight || "0");
      });
      setScrollWidth(total);
    };
    calcWidth();
    window.addEventListener("resize", calcWidth);
    return () => window.removeEventListener("resize", calcWidth);
  }, []);

  const featuredProducts = products.slice(0, 8);

  return (
    <main className="home" style={{ display: "flex", width: "100%", maxWidth: 1400, margin: "0 auto", alignItems: "stretch" }}>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 1200, margin: '0 auto' }}>
        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-image">
              <img src={heroSrc} alt="RR Nagar" loading="lazy" />
            </div>

            <div className="hero-text">
              <h1>ನಮ್ಮಿಂದ ನಿಮಗೆ — ನಿಮ್ಮಷ್ಟೇ ಹತ್ತಿರ.</h1>
              <p>From Us To You — As Close As You Need Us.</p>

              <div className="hero-search">
                <input
                  placeholder="Search groceries, flowers, products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button onClick={handleSearchClick}>Search</button>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="section">
          <h2 className="section-title">Popular Categories</h2>
          <div className="cat-row">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="cat-card"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <span className="icon">{cat.icon || "🛍️"}</span>
                <span className="label">{cat.name}</span>
                <span className="label-kannada">{cat.nameKannada}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ADS */}
        <section className="section">
          <h2 className="section-title">What’s New in RR Nagar</h2>
          <div className="ads-viewport">
            <div className="ads-track">
              {adsLoop.map((ad, i) => (
                <a key={i} href={ad.link} target="_blank" rel="noreferrer" className="ad-item">
                  <div className="ad-title">{ad.title}</div>
                  <img src={ad.image} alt={ad.title} />
                  <div className="ad-cta">Tap to view</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* DISCOVER */}
        <section className="section">
          <h2 className="section-title">Discover Around You</h2>
          <div className="discover-viewport">
            <div
              ref={discoverRef}
              className="discover-track"
              style={{ "--scroll-width": `${scrollWidth}px` }}
            >
              {[...discover, ...discover].map((item, i) => (
                <div className="discover-item" key={i}>
                  <ExploreItem
                    {...item}
                    ref={el => discoverItemRefs.current[i] = el}
                    onClick={() => setPopup({ open: true, item, anchor: { current: discoverItemRefs.current[i] } })}
                  />
                </div>
              ))}
              {popup.open && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.08)' }}
                    onClick={() => setPopup({ open: false, item: null, anchor: null })}
                  />
                  <DiscoverPopup
                    item={popup.item}
                    anchorRef={popup.anchor}
                    onClose={() => setPopup({ open: false, item: null, anchor: null })}
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="section">
          <h2 className="section-title">Fresh Picks for You</h2>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToBag(product)}
                style={{ cursor: 'pointer' }}
              >
                <ProductCard product={products.find(p => p.id === product.id) || product} />
              </div>
            ))}
          </div>
        </section>
      </div>


    </main>
  );
}
