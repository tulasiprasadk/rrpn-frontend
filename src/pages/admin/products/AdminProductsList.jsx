import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductSuppliers from "./ProductSuppliers";
import "./AdminProductsList.css";

const AdminProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managingProductId, setManagingProductId] = useState(null);
  
  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, id, title, variety, subVariety, price, unit, category
  const [sortBy, setSortBy] = useState("id"); // id, title, price, variety
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/products", { withCredentials: true });
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        switch (filterBy) {
          case "id":
            return String(p.id).includes(term);
          case "title":
            return (p.title || "").toLowerCase().includes(term);
          case "variety":
            return (p.variety || "").toLowerCase().includes(term);
          case "subVariety":
            return (p.subVariety || "").toLowerCase().includes(term);
          case "price":
            return String(p.price || "").includes(term);
          case "unit":
            return (p.unit || "").toLowerCase().includes(term);
          case "category":
            return (p.Category?.name || "").toLowerCase().includes(term);
          case "description":
            return (p.description || "").toLowerCase().includes(term);
          case "status":
            return (p.status || "").toLowerCase().includes(term);
          case "supplierId":
            return String(p.supplierId || "").includes(term);
          case "categoryId":
            return String(p.categoryId || p.CategoryId || "").includes(term);
          case "all":
          default:
            return (
              String(p.id).includes(term) ||
              (p.title || "").toLowerCase().includes(term) ||
              (p.variety || "").toLowerCase().includes(term) ||
              (p.subVariety || "").toLowerCase().includes(term) ||
              String(p.price || "").includes(term) ||
              (p.unit || "").toLowerCase().includes(term) ||
              (p.Category?.name || "").toLowerCase().includes(term) ||
              (p.description || "").toLowerCase().includes(term) ||
              (p.status || "").toLowerCase().includes(term) ||
              String(p.supplierId || "").includes(term) ||
              String(p.categoryId || p.CategoryId || "").includes(term)
            );
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "title":
          aVal = (a.title || "").toLowerCase();
          bVal = (b.title || "").toLowerCase();
          break;
        case "price":
          aVal = parseFloat(a.price || 0);
          bVal = parseFloat(b.price || 0);
          break;
        case "variety":
          aVal = (a.variety || "").toLowerCase();
          bVal = (b.variety || "").toLowerCase();
          break;
        case "subVariety":
          aVal = (a.subVariety || "").toLowerCase();
          bVal = (b.subVariety || "").toLowerCase();
          break;
        case "unit":
          aVal = (a.unit || "").toLowerCase();
          bVal = (b.unit || "").toLowerCase();
          break;
        case "status":
          aVal = (a.status || "").toLowerCase();
          bVal = (b.status || "").toLowerCase();
          break;
        case "createdAt":
          aVal = new Date(a.createdAt || 0);
          bVal = new Date(b.createdAt || 0);
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterBy, sortBy, sortOrder]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(`/api/admin/products/${id}`, {
        withCredentials: true
      });
      loadProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Failed to delete product");
    }
  };

  // Handle table header click for sorting
  const handleHeaderClick = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h1>All Products</h1>
        <div className="admin-products-actions">
          <Link to="/admin/products/new" className="admin-button primary">
            ➕ Add Product
          </Link>
          <Link to="/admin/products/bulk" className="admin-button primary">
            📊 Bulk Upload
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="admin-products-filters">
        <div className="filter-group">
          <label>Filter By:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
          >
            <option value="all">All Fields</option>
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="variety">Variety</option>
            <option value="subVariety">Sub-Variety</option>
            <option value="price">Price</option>
            <option value="unit">Unit</option>
            <option value="category">Category</option>
            <option value="description">Description</option>
            <option value="status">Status</option>
            <option value="supplierId">Supplier ID</option>
            <option value="categoryId">Category ID</option>
          </select>
        </div>

        <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
          <label>Search:</label>
          <input
            type="text"
            placeholder={`Search by ${filterBy === 'all' ? 'any field' : filterBy}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', marginRight: '8px' }}
          >
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="variety">Variety</option>
            <option value="subVariety">Sub-Variety</option>
            <option value="unit">Unit</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
            <option value="createdAt">Created Date</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
          >
            <option value="asc">Ascending (Low to High)</option>
            <option value="desc">Descending (High to Low)</option>
          </select>
        </div>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterBy("all");
            }}
            className="admin-button outline"
            style={{ marginLeft: 'auto' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="results-count">
          Showing {filteredProducts.length} of {products.length} products
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>
            {searchTerm
              ? `No products found matching "${searchTerm}"`
              : "No products found. Upload some products using bulk upload!"}
          </p>
          {!searchTerm && (
            <Link to="/admin/products/bulk" className="admin-button primary">
              📊 Go to Bulk Upload
            </Link>
          )}
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleHeaderClick('id')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by ID"
                >
                  ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleHeaderClick('title')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Title"
                >
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleHeaderClick('variety')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Variety"
                >
                  Variety {sortBy === 'variety' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleHeaderClick('subVariety')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Sub-Variety"
                >
                  Sub-Variety {sortBy === 'subVariety' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleHeaderClick('price')}
                  style={{ 
                    cursor: 'pointer', 
                    userSelect: 'none', 
                    color: sortBy === 'price' ? '#e31e24' : 'inherit',
                    fontWeight: sortBy === 'price' ? '700' : '600',
                    background: sortBy === 'price' ? '#fff3cd' : 'inherit'
                  }}
                  title="Click to sort by Price (Low to High / High to Low)"
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑ Low to High' : '↓ High to Low')}
                </th>
                <th 
                  onClick={() => handleHeaderClick('unit')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Unit"
                >
                  Unit {sortBy === 'unit' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleHeaderClick('category')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by Category"
                >
                  Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => (
                <tr key={p.id} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td>{p.id}</td>
                  <td style={{ fontWeight: '600' }}>{p.title}</td>
                  <td>{p.variety || '-'}</td>
                  <td>{p.subVariety || '-'}</td>
                  <td style={{ fontWeight: '600', color: '#28a745' }}>₹{p.price}</td>
                  <td>{p.unit || '-'}</td>
                  <td>{p.Category?.name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="admin-button"
                        style={{
                          background: '#007bff',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          display: 'inline-block'
                        }}
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => setManagingProductId(p.id)}
                        className="admin-button"
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        👥 Suppliers
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="admin-button"
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Suppliers Modal */}
      {managingProductId && (
        <ProductSuppliers
          productId={managingProductId}
          onClose={() => setManagingProductId(null)}
        />
      )}
    </div>
  );
};

export default AdminProductsList;
