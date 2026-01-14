import React from "react";

// Small inline SVG icons for common categories/varieties.
// Keeps bundle small and avoids external assets.
export default function CategoryIcon({ category, variety, size = 16, className, svg = false, name, icon }) {
  // If icon is provided directly (from database), use it first
  if (icon && !svg) {
    return <span className={className} style={{ fontSize: size, lineHeight: 1, display: 'inline-block' }}>{icon}</span>;
  }

  const key = (name || variety || category || "").toString().toLowerCase();

  const contains = (s) => key.indexOf(s) !== -1;

  // Emoji-first mapping: try to match product name/variety, then category
  // IMPORTANT: Longer/more specific terms MUST come first to avoid partial matches
  // (e.g., "pineapple" before "apple" so "Pineapple Pastry" matches correctly)
  const nameEmojiMap = [
    // Fruits - Longer names first to avoid partial matches
    ["pineapple", "🍍"], ["pineapples", "🍍"],
    ["watermelon", "🍉"], ["watermelons", "🍉"],
    ["strawberry", "🍓"], ["strawberries", "🍓"],
    ["custard apple", "🍎"], // Specific compound names first
    ["royal gala", "🍎"], ["fuji", "🍎"], ["washington", "🍎"], ["shimla", "🍎"],
    ["apple", "🍎"], ["apples", "🍎"], // Generic apple after specific types
    ["banana", "🍌"], ["bananas", "🍌"],
    ["mango", "🥭"], ["mangoes", "🥭"], ["mangos", "🥭"],
    ["pear", "🍐"], ["pears", "🍐"],
    ["orange", "🍊"], ["oranges", "🍊"],
    ["grape", "🍇"], ["grapes", "🍇"],
    ["cherry", "🍒"], ["cherries", "🍒"],
    ["peach", "🍑"], ["peaches", "🍑"],
    ["kiwi", "🥝"], ["kiwis", "🥝"],
    ["coconut", "🥥"], ["coconuts", "🥥"],
    // Bakery - Specific items first
    ["pineapple pastry", "🍍"], // Compound names first
    ["custard pastry", "🍮"],
    ["pastry", "🥐"], ["pastries", "🥐"],
    ["custard", "🍮"], ["custards", "🍮"],
    ["cake", "🍰"], ["cakes", "🍰"],
    ["bread", "🍞"], ["breads", "🍞"],
    ["cookie", "🍪"], ["cookies", "🍪"],
    ["donut", "🍩"], ["donuts", "🍩"],
    // Crackers/Fireworks
    ["firework", "🎆"], ["fireworks", "🎆"],
    ["sparkler", "🪔"], ["sparklers", "🪔"],
    ["cracker", "🧨"], ["crackers", "🧨"],
    ["spark", "✨"], ["sparks", "✨"],
    ["rocket", "🚀"],
    // Flowers
    ["sunflower", "🌻"], ["sunflowers", "🌻"],
    ["mallige", "🌼"], ["malliges", "🌼"],
    ["jasmine", "🌸"], ["jasmines", "🌸"],
    ["lotus", "🪷"], ["lotuses", "🪷"],
    ["rose", "🌹"], ["roses", "🌹"],
    ["flower", "💐"], ["flowers", "💐"],
    // Dairy & Proteins
    ["chicken", "🍗"], ["chickens", "🍗"],
    ["milk", "🥛"], ["milks", "🥛"],
    ["cheese", "🧀"], ["cheeses", "🧀"],
    ["egg", "🥚"], ["eggs", "🥚"],
    ["fish", "🐟"], ["fishes", "🐟"],
    ["meat", "🥩"], ["meats", "🥩"],
    // Beverages
    ["coffee", "☕"], ["coffees", "☕"],
    ["juice", "🧃"], ["juices", "🧃"],
    ["tea", "🍵"], ["teas", "🍵"],
    ["water", "💧"], ["waters", "💧"],
    // Groceries
    ["wheat", "🌾"], ["wheats", "🌾"],
    ["lentil", "🫘"], ["lentils", "🫘"],
    ["dal", "🫘"], ["dals", "🫘"],
    ["soap", "🧼"], ["soaps", "🧼"],
    ["rice", "🍚"], ["rices", "🍚"],
    ["sugar", "🍬"], ["sugars", "🍬"],
    ["salt", "🧂"], ["salts", "🧂"],
    ["oil", "🫒"], ["oils", "🫒"],
  ];

  // Sort by length (longest first) to match more specific terms first
  const sortedMap = [...nameEmojiMap].sort((a, b) => b[0].length - a[0].length);

  for (const [k, em] of sortedMap) {
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



