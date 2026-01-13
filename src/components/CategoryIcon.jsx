import React from "react";

// Small inline SVG icons for common categories/varieties.
// Keeps bundle small and avoids external assets.
export default function CategoryIcon({ category, variety, size = 16, className, svg = false, name }) {
  const key = (name || variety || category || "").toString().toLowerCase().trim();

  // Improved matching: check if key contains the search term, or if search term is at word boundary
  const contains = (s) => {
    const lowerS = s.toLowerCase();
    // Exact match or word boundary match
    return key === lowerS || 
           key.indexOf(lowerS) !== -1 || 
           key.split(/\s+/).some(word => word === lowerS || word.startsWith(lowerS));
  };

  // Emoji-first mapping: try to match product name/variety, then category
  // Order matters - more specific matches first
  const nameEmojiMap = [
    // Bakery items - order matters, more specific first
    ["black forest cake", "🍰"],
    ["black forest", "🍰"],
    ["chocolate cake", "🍰"],
    ["chocolate chip cookies", "🍪"],
    ["chocolate chip", "🍪"],
    ["chocolate muffin", "🧁"],
    ["chocolate pastry", "🥐"],
    ["butter cookies", "🍪"],
    ["cup cake", "🧁"],
    ["cupcake", "🧁"],
    ["cream roll", "🍰"],
    ["egg puff", "🥐"],
    ["eggpuff", "🥐"],
    ["donut", "🍩"],
    ["doughnut", "🍩"],
    ["croissant", "🥐"],
    ["burger bun", "🍞"],
    ["bun", "🍞"],
    ["brown bread", "🍞"],
    ["cookies", "🍪"],
    ["cookie", "🍪"],
    ["pastry", "🥐"],
    ["cake", "🍰"],
    ["bread", "🍞"],
    ["muffin", "🧁"],
    
    // Fruits
    ["apple", "🍎"],
    ["pineapple", "🍍"],
    ["banana", "🍌"],
    ["mango", "🥭"],
    ["pear", "🍐"],
    ["orange", "🍊"],
    ["grapes", "🍇"],
    ["watermelon", "🍉"],
    ["strawberry", "🍓"],
    
    // Dairy
    ["milk", "🥛"],
    ["cheese", "🧀"],
    ["butter", "🧈"],
    ["yogurt", "🥛"],
    ["curd", "🥛"],
    
    // Meat & Protein
    ["chicken", "🍗"],
    ["fish", "🐟"],
    ["egg", "🥚"],
    ["prawn", "🦐"],
    
    // Beverages
    ["tea", "🍵"],
    ["coffee", "☕"],
    ["juice", "🧃"],
    ["water", "💧"],
    ["soda", "🥤"],
    
    // Groceries/Staples
    ["rice", "🍚"],
    ["sugar", "🍬"],
    ["salt", "🧂"],
    ["flour", "🌾"],
    ["oil", "🫒"],
    ["dal", "🫘"],
    ["lentil", "🫘"],
    
    // Personal Care
    ["soap", "🧼"],
    ["shampoo", "🧴"],
    ["toothpaste", "🪥"],
    
    // Crackers & Fireworks
    ["cracker", "🧨"],
    ["sparkler", "🪔"],
    ["spark", "✨"],
    ["firework", "🎆"],
    
    // Flowers
    ["rose", "🌹"],
    ["mallige", "🌼"],
    ["jasmine", "🌸"],
    ["flower", "💐"],
    ["marigold", "🌼"],
    
    // Desserts
    ["custard", "🍮"],
    ["ice cream", "🍦"],
    ["pudding", "🍮"],
  ];

  for (const [k, em] of nameEmojiMap) {
    if (contains(k)) return svg ? null : (
      <span className={className} style={{ fontSize: size, lineHeight: 1, display: 'inline-block' }}>{em}</span>
    );
  }

  // Category fallback
  const cat = (category || "").toString().toLowerCase();
  if (cat.indexOf("fruit") !== -1 || cat.indexOf("fruits") !== -1) return svg ? null : <span className={className} style={{ fontSize: size }}>{"🍎"}</span>;
  if (cat.indexOf("bakery") !== -1 || cat.indexOf("bread") !== -1) return svg ? null : <span className={className} style={{ fontSize: size }}>{"🥐"}</span>;
  if (cat.indexOf("flower") !== -1) return svg ? null : <span className={className} style={{ fontSize: size }}>{"💐"}</span>;
  if (cat.indexOf("cracker") !== -1 || cat.indexOf("spark") !== -1 || cat.indexOf("firework") !== -1) return svg ? null : <span className={className} style={{ fontSize: size }}>{"🧨"}</span>;
  if (cat.indexOf("grocery") !== -1 || cat.indexOf("groceries") !== -1 || cat.indexOf("staple") !== -1) return svg ? null : <span className={className} style={{ fontSize: size }}>{"🧺"}</span>;

  // If svg flag requested, return existing SVG set (small bag icon as fallback)
  if (svg) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 7L6.5 6C7 4 8 3 12 3C16 3 17 4 17.5 6L18 7H6Z" fill="#FFE082"/>
        <path d="M5 7H19L18 20H6L5 7Z" fill="#FFB74D"/>
      </svg>
    );
  }

  // Default emoji bag
  return <span className={className} style={{ fontSize: size, lineHeight: 1 }}>🛍️</span>;
}



