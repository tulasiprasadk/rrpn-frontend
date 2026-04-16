// frontend/src/pages/ProductBrowser.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import CategoryLayout from "../components/CategoryLayout";

function ProductBrowser() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const categoryId = searchParams.get("categoryId") || "";

	// Sync searchQuery with URL param
	useEffect(() => {
		setSearchQuery(searchParams.get("q") || "");
	}, [searchParams]);

	useEffect(() => {
		fetchProducts();
		 
	}, [searchQuery, categoryId]);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const data = await getProducts(searchQuery, categoryId);
			setProducts(data || []);
		} catch (err) {
			setProducts([]);
			console.error("Error loading products:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleSearch = () => {
		const params = {};
		if (searchQuery) params.q = searchQuery;
		if (categoryId) params.categoryId = categoryId;
		setSearchParams(params);
	};

		return (
			<CategoryLayout title={categoryId ? "Category" : "Browse Products"} category="products">
				<div style={{ padding: 24 }}>
					<div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
						<input
							type="text"
							placeholder="Search for products, varieties..."
							value={searchQuery}
							onChange={handleInputChange}
							style={{ padding: 8, fontSize: 16, width: 300, marginRight: 12 }}
						/>
						<button onClick={handleSearch} style={{ padding: "8px 18px", fontSize: 16 }}>
							🔍 Search
						</button>
					</div>
					{loading ? (
						<div>Loading products…</div>
					) : products.length === 0 ? (
						<div>No products found.</div>
					) : (
						<div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 20, alignItems: "stretch" }}>
							{products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</div>
			</CategoryLayout>
		);
}

export default ProductBrowser;



