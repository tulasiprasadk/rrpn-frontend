// frontend/src/pages/ProductBrowser.jsx


import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";



// ...existing code...


import { getProducts } from "../api";



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
		// eslint-disable-next-line
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
		<div style={{ padding: 24 }}>
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
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
					{products.map((product) => (
						<div
							key={product.id}
							style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fff', cursor: 'pointer' }}
							onClick={() => navigate(`/product/${product.id}`)}
						>
							<img
								src={product.imageUrl || product.image || "/images/product-placeholder.png"}
								alt={product.title}
								style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }}
								loading="lazy"
							/>
							<h3 style={{ fontSize: 18, margin: '8px 0 4px 0' }}>{product.title}</h3>
							<div style={{ color: '#e31e24', fontWeight: 700, fontSize: 16 }}>₹{product.price}</div>
							<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{product.variety || product.subVariety}</div>
							<div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>{product.description}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default ProductBrowser;
