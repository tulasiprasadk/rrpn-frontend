import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { API_BASE } from "../../../config/api";

const AdminProductForm = ({ mode }) => {
  const { adminToken } = useAdminAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    categoryId: "",
    supplierId: "",
    unit: "",
    variety: "",
    subVariety: "",
    monthlyPrice: "",
    hasMonthlyPackage: false,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load product when editing
  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      fetch(`${API_BASE}/admin/products/${id}`, {
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('Loaded product data:', data);
          setProduct({
            title: data.title ?? "",
            price: data.price ?? "",
            stock: data.stock ?? "",
            description: data.description ?? "",
            categoryId: data.categoryId ?? data.CategoryId ?? "",
            supplierId: data.supplierId ?? "",
            unit: data.unit ?? "",
            variety: data.variety ?? "",
            subVariety: data.subVariety ?? "",
            monthlyPrice: data.monthlyPrice ?? "",
            hasMonthlyPackage: data.hasMonthlyPackage ?? false,
          });
          if (data.image || data.imageUrl) {
            setPreview(data.image || data.imageUrl);
          }
        })
        .catch((err) => {
          console.error("Failed to load product", err);
          setError("Failed to load product: " + err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProduct({ ...product, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const method = mode === "edit" ? "PUT" : "POST";
    const url = mode === "edit"
      ? `${API_BASE}/admin/products/${id}`
      : `${API_BASE}/admin/products`;

    // Prepare data - convert price to number
    const submitData = {
      title: product.title,
      price: parseFloat(product.price) || 0,
      description: product.description || "",
      unit: product.unit || "",
      variety: product.variety || "",
      subVariety: product.subVariety || "",
      categoryId: product.categoryId ? parseInt(product.categoryId) : null,
      monthlyPrice: product.monthlyPrice ? parseFloat(product.monthlyPrice) : null,
      hasMonthlyPackage: product.hasMonthlyPackage === true || product.hasMonthlyPackage === 'true',
    };

    console.log('Submitting product:', submitData);

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(mode === "edit" ? "Product updated successfully!" : "Product created successfully!");
        navigate("/admin/products");
      } else {
        console.error('Save failed:', data);
        setError("Failed to save product: " + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError("Failed to save product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode === "edit") {
    return <div>Loading product...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        {mode === "edit" ? "Edit Product" : "Add Product"}
      </h1>

      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Product Title *</label>
          <input
            type="text"
            placeholder="Product Title"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            value={product.title}
            onChange={handleChange("title")}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            value={product.price}
            onChange={handleChange("price")}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={product.hasMonthlyPackage}
            onChange={handleChange("hasMonthlyPackage")}
          />
          <label>Has Monthly Package</label>
        </div>

        {product.hasMonthlyPackage && (
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Monthly Price (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Monthly Price"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              value={product.monthlyPrice}
              onChange={handleChange("monthlyPrice")}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Unit</label>
          <input
            type="text"
            placeholder="Unit (e.g., kg, piece)"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            value={product.unit}
            onChange={handleChange("unit")}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Variety</label>
          <input
            type="text"
            placeholder="Variety (optional)"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            value={product.variety}
            onChange={handleChange("variety")}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Sub-Variety</label>
          <input
            type="text"
            placeholder="Sub-Variety (optional)"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            value={product.subVariety}
            onChange={handleChange("subVariety")}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label>
          <textarea
            placeholder="Description"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px' }}
            value={product.description}
            onChange={handleChange("description")}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Category ID</label>
          <input
            type="number"
            placeholder="Category ID"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            value={product.categoryId}
            onChange={handleChange("categoryId")}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#28a745',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Saving..." : (mode === "edit" ? "Update Product" : "Create Product")}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
