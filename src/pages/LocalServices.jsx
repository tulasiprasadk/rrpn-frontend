
import React, { useMemo } from "react";
import services from "../data/local_services.json";
import ProductCard from "../components/ProductCard";
import CartPanel from "../components/CartPanel";
import { useCrackerCart } from "../context/CrackerCartContext";


export default function LocalServices() {
  const { addItem } = useCrackerCart();

  // Flatten all services into a single array, add category
  const allServices = useMemo(() =>
    services.flatMap(cat => cat.items.map(service => ({ ...service, category: cat.category }))),
    [services]
  );

  // Group by subCategory (or category if missing)
  const grouped = useMemo(() => {
    const out = {};
    allServices.forEach((s) => {
      const v = s.subCategory || s.category || "Other";
      if (!out[v]) out[v] = [];
      out[v].push(s);
    });
    return out;
  }, [allServices]);

  function addItemToBag(service) {
    addItem({
      id: service.id,
      title: service.name,
      titleKannada: service.kn,
      knDisplay: service.kn,
      price: service.price,
      image: service.image,
      emoji: service.emoji,
      category: service.category,
      description: service.priceType ? `${service.priceType}${service.price ? `: ₹${service.price}` : ''}` : undefined,
    }, 1);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FFFDE7" }}>
      <div style={{ flex: 1, padding: "24px 32px" }}>
        <h1 style={{ marginBottom: 8, color: "#C8102E", textAlign: 'center' }}>
          <span style={{ color: '#C8102E' }}>🛠️</span> <span style={{ color: '#C8102E' }}>Local Services</span>
        </h1>
        <p style={{ color: "#C8102E", marginBottom: 24, textAlign: 'center' }}>
          Book trusted local services in RR Nagar. Inspection-based or fixed pricing.
        </p>
        {Object.entries(grouped).map(([variety, items]) => (
          <div key={variety} style={{ marginBottom: 32, background: '#FFF9C4', borderRadius: 12, padding: 12 }}>
            <h2 style={{ borderBottom: '2px solid #C8102E', paddingBottom: 6, color: '#C8102E', fontSize: 20, textAlign: 'center' }}>{variety}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16, marginTop: 16 }}>
              {items.map((service) => (
                <ProductCard
                  key={service.id}
                  product={{
                    id: service.id,
                    title: service.name,
                    titleKannada: service.kn,
                    knDisplay: service.kn,
                    price: service.price,
                    image: service.image,
                    emoji: service.emoji,
                    category: service.category,
                    description: service.priceType ? `${service.priceType}${service.price ? `: ₹${service.price}` : ''}` : undefined,
                  }}
                  style={{ background: '#FFF9C4', color: '#C8102E' }}
                  textColor="#C8102E"
                  emojiColor="#C8102E"
                  onClick={() => addItemToBag(service)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        position: 'sticky',
        top: 32,
        alignSelf: 'flex-start',
        height: 'fit-content',
        zIndex: 10
      }}>
        <CartPanel orderType="LOCAL_SERVICES" />
      </div>
    </div>
  );
}



