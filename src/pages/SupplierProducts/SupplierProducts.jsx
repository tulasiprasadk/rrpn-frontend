import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import "./SupplierProducts.css";

const parseBulkPriceText = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, price] = line.split(",").map((part) => part.trim());
      return {
        productId: Number(id),
        price: Number(price)
      };
    });

function SupplierProducts() {
  const [products, setProducts] = useState([]);
  const [priceDrafts, setPriceDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    try {
      const res = await api.get("/products?supplier=true");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list);
      setPriceDrafts(
        list.reduce((acc, product) => {
          acc[product.id] = product.price ?? "";
          return acc;
        }, {})
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.title, product.description, product.variety]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, search]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const savePrice = async (productId) => {
    const nextPrice = Number.parseFloat(priceDrafts[productId]);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      alert("Enter a valid non-negative price");
      return;
    }

    try {
      setSavingId(productId);
      await api.patch(`/supplier/products/${productId}/price`, { price: nextPrice });
      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? { ...product, price: nextPrice } : product
        )
      );
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to update price");
    } finally {
      setSavingId(null);
    }
  };

  const runBulkPriceUpdate = async () => {
    const updates = parseBulkPriceText(bulkText);
    if (updates.length === 0) {
      alert("Paste productId,price rows first");
      return;
    }
    const invalid = updates.find((row) => !Number.isInteger(row.productId) || !Number.isFinite(row.price) || row.price < 0);
    if (invalid) {
      alert("Each row must be productId,price");
      return;
    }

    try {
      setBulkSaving(true);
      const { data } = await api.post("/supplier/products/prices/bulk", { updates });
      alert(`Updated ${data?.updated || 0} prices${data?.errors?.length ? `, ${data.errors.length} failed` : ""}.`);
      setBulkText("");
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Bulk price update failed");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="supplier-products">
      <h2>Your Products and Price Updates</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <button className="add-btn" onClick={() => (window.location.href = "/supplier/products/add")}>
          Add New Product
        </button>
        <input
          type="search"
          placeholder="Search your products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ minWidth: 240, padding: "10px 12px", borderRadius: 8, border: "1px solid #d0d0d0" }}
        />
      </div>

      <div
        style={{
          background: "#fff4bf",
          border: "1px solid #edd36b",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}
      >
        <h3 style={{ marginTop: 0 }}>Bulk price update</h3>
        <p style={{ marginTop: 0 }}>
          Paste one row per line in the format <strong>productId,price</strong>. This only changes prices and leaves the rest of the product details untouched.
        </p>
        <textarea
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          rows={6}
          placeholder={"101,150\n102,275"}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d0d0d0" }}
        />
        <div style={{ marginTop: 12 }}>
          <button onClick={runBulkPriceUpdate} disabled={bulkSaving} className="add-btn">
            {bulkSaving ? "Updating..." : "Update Prices in Bulk"}
          </button>
        </div>
      </div>

      {filteredProducts.map((product) => (
        <div key={product.id} className="product-card">
          <img src={product.image || "/placeholder.png"} alt={product.title ? `Product image of ${product.title}` : "Product image"} loading="lazy" />
          <div className="info">
            <h3>{product.title}</h3>
            <p>Current Price: Rs {Number(product.price || 0).toFixed(2)}</p>
            <p>{product.description}</p>
            <p style={{ color: "#555", fontSize: 14 }}>Product ID: {product.id}</p>
          </div>

          <div className="actions" style={{ gap: 10 }}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceDrafts[product.id] ?? ""}
              onChange={(event) =>
                setPriceDrafts((current) => ({ ...current, [product.id]: event.target.value }))
              }
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d0d0d0", width: 140 }}
            />
            <button onClick={() => savePrice(product.id)} disabled={savingId === product.id}>
              {savingId === product.id ? "Saving..." : "Save Price"}
            </button>
            <button onClick={() => (window.location.href = `/supplier/products/${product.id}/edit`)}>
              Full Edit
            </button>
            <button className="del" onClick={() => deleteProduct(product.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SupplierProducts;
