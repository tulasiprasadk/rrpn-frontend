// frontend/src/pages/ProductBrowser.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./ProductBrowser.css";

export default function ProductBrowser() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [addingToCart, setAddingToCart] = useState(null);
  
  const [groupedProducts, setGroupedProducts] = useState({});

  useEffect(() => {
    loadCategories();
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    
    if (category) {
      setSelectedCategory(parseInt(category));
    }
    if (query) {
      setSearchQuery(query);
      searchProducts(query);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadVarieties(selectedCategory);
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  async function loadCategories() {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function loadVarieties(categoryId) {
    try {
      const res = await axios.get(`/api/varieties/category/${categoryId}`);
      setVarieties(res.data);
    } catch (err) {
      console.error('Error loading varieties:', err);
    }
  }

  async function loadProductsByCategory(categoryId) {
    try {
      const res = await axios.get(`/api/products?categoryId=${categoryId}`);
      setProducts(res.data);
      groupProductsByVariety(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  async function searchProducts(query) {
    try {
      const res = await axios.get(`/api/products?search=${query}`);
      setProducts(res.data);
      groupProductsByVariety(res.data);
    } catch (err) {
      console.error('Error searching products:', err);
    }
  }

  function groupProductsByVariety(productList) {
    const grouped = {};
    
    productList.forEach(product => {
      const variety = product.variety || 'Other';
      if (!grouped[variety]) {
        grouped[variety] = [];
      }
      grouped[variety].push(product);
    });
    
    setGroupedProducts(grouped);
  }

  async function addToCart(product) {
    setAddingToCart(product.id);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find(item => item.id === product.id);
      
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          titleKannada: product.titleKannada,
          description: product.description,
          descriptionKannada: product.descriptionKannada,
          price: product.price,
          unit: product.unit,
          quantity: 1,
          image: product.image,
          variety: product.variety,
          subVariety: product.subVariety
        });
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`✓ ${product.title} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  }

  async function addToCartWithQty(product, quantity) {
    setAddingToCart(product.id);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find(item => item.id === product.id);
      
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          titleKannada: product.titleKannada,
          description: product.description,
          descriptionKannada: product.descriptionKannada,
          price: product.price,
          unit: product.unit,
          quantity: quantity,
          image: product.image,
          variety: product.variety,
          subVariety: product.subVariety
        });
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`✓ ${quantity} × ${product.title} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    }
  }

  return (
    <div className="product-browser">
      <div className="browser-header">
        <h1>🛍 Browse Products{selectedCategory && ` - ${categories.find(c => c.id === selectedCategory)?.name || ''}`}</h1>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products, varieties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Search</button>
        </div>
      </div>

      <div className="browser-content">
        {/* Sidebar - Categories & Varieties */}
        <aside className="browser-sidebar">
          <div className="sidebar-section">
            <h3>📦 Categories</h3>
            <div className="category-list">
              <button
                className={!selectedCategory ? 'active' : ''}
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedVariety(null);
                  setProducts([]);
                  setGroupedProducts({});
                }}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={selectedCategory === cat.id ? 'active' : ''}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedVariety(null);
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {varieties.length > 0 && (
            <div className="sidebar-section">
              <h3>🏷 Varieties</h3>
              <div className="variety-list">
                <button
                  className={!selectedVariety ? 'active' : ''}
                  onClick={() => setSelectedVariety(null)}
                >
                  All Varieties
                </button>
                {varieties.map(variety => (
                  <button
                    key={variety.id}
                    className={selectedVariety === variety.id ? 'active' : ''}
                    onClick={() => setSelectedVariety(variety.id)}
                  >
                    {variety.name}
                    <span className="sub-count">
                      {variety.subVarieties?.length || 0} types
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content - Products Grouped by Variety */}
        <main className="browser-main">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="empty-state">
              <p>No products found. Try selecting a category or searching.</p>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([variety, productList]) => {
              // Filter by selected variety if any
              if (selectedVariety) {
                const selectedVarietyObj = varieties.find(v => v.id === selectedVariety);
                if (selectedVarietyObj && selectedVarietyObj.name !== variety) {
                  return null;
                }
              }

              return (
                <div key={variety} className="variety-group">
                  <h2 className="variety-title">
                    <span className="variety-name">{variety}</span>
                    <span className="variety-count">{productList.length} products</span>
                  </h2>
                  
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>ಉತ್ಪನ್ನದ ಹೆಸರು</th>
                        <th>Category</th>
                        <th>Sub-Variety</th>
                        <th>Price</th>
                        <th>Unit</th>
                        <th>Qty</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productList.map(product => (
                        <tr key={product.id} className="product-row">
                          <td className="product-name">
                            {product.image && (
                              <img 
                                src={`/${product.image}`} 
                                alt={product.title} 
                                style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10, borderRadius: 4, display: 'inline-block', verticalAlign: 'middle' }}
                              />
                            )}
                            <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <strong>{product.title}</strong>
                            </div>
                          </td>
                          <td className="product-name-kannada">
                            <div style={{ fontSize: '15px', color: '#c8102e', fontWeight: 600 }}>
                              {product.titleKannada || ''}
                            </div>
                          </td>
                          <td>{product.Category?.name || '—'}</td>
                          <td>{product.subVariety || '—'}</td>
                          <td style={{ fontWeight: 'bold', color: '#28a745' }}>₹{product.price}</td>
                          <td>{product.unit || 'piece'}</td>
                          <td>
                            <input 
                              type="number" 
                              min="1" 
                              defaultValue="1" 
                              id={`qty-${product.id}`}
                              style={{ width: 60, padding: 5, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                          </td>
                          <td>
                            <button 
                              className="add-to-cart-btn"
                              onClick={() => {
                                const qty = parseInt(document.getElementById(`qty-${product.id}`).value) || 1;
                                addToCartWithQty(product, qty);
                              }}
                              disabled={addingToCart === product.id}
                              style={{ padding: '6px 12px', fontSize: 14, whiteSpace: 'nowrap' }}
                            >
                              {addingToCart === product.id ? '🔄' : '🛒 Add'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
