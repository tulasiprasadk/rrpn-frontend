// frontend/src/pages/ProductBrowser.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import CartPanel from "../components/CartPanel";

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
		<div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
			<div style={{ flex: 1, padding: 24 }}>
			<div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
				<input
					type="text"
					placeholder="Search for products, varieties..."
					value={searchQuery}
					onChange={handleInputChange}
					style={{ padding: 8, fontSize: 16, width: 300, marginRight: 12 }}
				/>
				<button onClick={handleSearch} style={{ padding: '8px 18px', fontSize: 16 }}>
					🔍 Search
				</button>
			</div>
			{loading ? (
				<div>Loading products…</div>
			) : products.length === 0 ? (
				<div>No products found.</div>
			) : (
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 16, alignItems: 'stretch' }}>
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							// Remove onClick - let ProductCard handle add to cart by default
							// User can click product name to navigate to detail page if needed
						/>
					))}
				</div>
			)}
			</div>
			<div style={{
				position: 'sticky',
				top: 32,
				alignSelf: 'flex-start',
				height: 'fit-content',
				zIndex: 10
			}}>
				<CartPanel />
			</div>
		</div>
	);
}

export default ProductBrowser;



