import React from "react";

// Small inline SVG icons for common categories/varieties.
// Keeps bundle small and avoids external assets.
export default function CategoryIcon({ category, variety, size = 16, className, svg = false, name }) {
  const key = (name || variety || category || "").toString().toLowerCase();

  const contains = (s) => key.indexOf(s) !== -1;

  // Emoji-first mapping: try to match product name/variety, then category
  const nameEmojiMap = [
    ["apple", "🍎"],
    ["pineapple", "🍍"],
    ["banana", "🍌"],
    ["mango", "🥭"],
    ["pear", "🍐"],
    ["custard", "🍮"],
    ["pastry", "🥐"],
    ["cake", "🍰"],
    ["bread", "🍞"],
    ["cracker", "🧨"],
    ["sparkler", "🪔"],
    ["spark", "✨"],
    ["firework", "🎆"],
    ["rose", "🌹"],
    ["mallige", "🌼"],
    ["jasmine", "🌸"],
    ["flower", "💐"],
    ["milk", "🥛"],
    ["cheese", "🧀"],
    ["egg", "🥚"],
    ["chicken", "🍗"],
    ["fish", "🐟"],
    ["tea", "🍵"],
    ["coffee", "☕"],
    ["juice", "🧃"],
    ["water", "💧"],
    ["soap", "🧼"],
    ["rice", "🍚"],
    ["sugar", "🍬"],
    ["salt", "🧂"],
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



