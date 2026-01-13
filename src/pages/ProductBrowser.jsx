// frontend/src/pages/ProductBrowser.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import { useCrackerCart } from "../context/CrackerCartContext";

function ProductBrowser() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { addItem } = useCrackerCart();

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

	const handleAddToBag = (product, e) => {
		e.stopPropagation(); // Prevent navigation when clicking add button
		const price = product.price || product.basePrice || product.amount || 0;
		addItem({ 
			id: product.id, 
			title: product.title || product.name, 
			name: product.name || product.title,
			price, 
			qty: 1 
		});
		window.dispatchEvent(new Event('cart-updated'));
		alert(`✓ ${product.title || product.name} added to bag!`);
	};

	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
				<input
					type="text"
					placeholder="Search for products, varieties..."
					value={searchQuery}
					onChange={handleInputChange}
					onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
							style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fff', position: 'relative' }}
						>
							<div 
								style={{ cursor: 'pointer' }}
								onClick={() => navigate(`/product/${product.id}`)}
							>
								<img
									src={product.imageUrl || product.image || "/images/product-placeholder.png"}
									alt={product.title}
									style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }}
									loading="lazy"
								/>
								<h3 style={{ fontSize: 18, margin: '8px 0 4px 0' }}>{product.title}</h3>
								<div style={{ color: '#e31e24', fontWeight: 700, fontSize: 16 }}>₹{product.price || 0}</div>
								<div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{product.variety || product.subVariety}</div>
								<div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>{product.description}</div>
							</div>
							<button
								onClick={(e) => handleAddToBag(product, e)}
								style={{
									width: '100%',
									marginTop: 12,
									padding: '10px',
									background: '#ffcc00',
									border: 'none',
									borderRadius: 6,
									fontWeight: 600,
									cursor: 'pointer',
									fontSize: 14
								}}
							>
								Add to Bag
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default ProductBrowser;



