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
    ["watermelon", "🍉"], ["watermelons", "🍉"],
    ["muskmelon", "🍈"], ["muskmelons", "🍈"],
    ["dragon fruit", "🐉"], ["dragonfruit", "🐉"],
    ["custard apple", "🍎"], ["sitaphal", "🍎"], ["seethaphal", "🍎"],
    ["pomegranate", "🍎"], ["pomegranates", "🍎"],
    ["strawberry", "🍓"], ["strawberries", "🍓"],
    ["blueberry", "🫐"], ["blueberries", "🫐"],
    ["pineapple", "🍍"], ["pineapples", "🍍"], ["ananas", "🍍"],
    ["royal gala", "🍎"], ["fuji", "🍎"], ["washington", "🍎"], ["shimla", "🍎"],
    ["alphonso", "🥭"], ["badami", "🥭"], ["totapuri", "🥭"], ["banganapalli", "🥭"],
    ["nagpur", "🍊"], ["mosambi", "🍊"], ["sweet lime", "🍊"],
    ["green grapes", "🍇"], ["black grapes", "🍇"],
    ["guava", "🍈"], ["guavas", "🍈"], ["chikoo", "🍈"], ["sapota", "🍈"],
    ["papaya", "🍈"], ["papayas", "🍈"],
    ["apricot", "🍑"], ["apricots", "🍑"],
    ["apple", "🍎"], ["apples", "🍎"],
    ["banana", "🍌"], ["bananas", "🍌"], ["yelakki", "🍌"], ["nendran", "🍌"], ["robusta", "🍌"], ["poovan", "🍌"],
    ["mango", "🥭"], ["mangoes", "🥭"], ["mangos", "🥭"],
    ["pear", "🍐"], ["pears", "🍐"],
    ["orange", "🍊"], ["oranges", "🍊"],
    ["grape", "🍇"], ["grapes", "🍇"],
    ["cherry", "🍒"], ["cherries", "🍒"],
    ["peach", "🍑"], ["peaches", "🍑"],
    ["plum", "🟣"], ["plums", "🟣"],
    ["kiwi", "🥝"], ["kiwis", "🥝"],
    ["coconut", "🥥"], ["coconuts", "🥥"],
    ["fig", "🟣"], ["figs", "🟣"],
    
    // Vegetables - Longer names first
    ["cluster beans", "🫛"], ["french beans", "🫛"], ["broad beans", "🫛"],
    ["ladies finger", "🫛"], ["okra", "🫛"],
    ["bottle gourd", "🥒"], ["ridge gourd", "🥒"], ["ash gourd", "🥒"],
    ["sweet corn", "🌽"], ["corn", "🌽"],
    ["green peas", "🫛"], ["peas", "🫛"],
    ["cauliflower", "🥦"], ["cauliflowers", "🥦"],
    ["cabbage", "🥬"], ["cabbages", "🥬"],
    ["capsicum", "🫑"], ["bell pepper", "🫑"],
    ["brinjal", "🍆"], ["eggplant", "🍆"],
    ["beetroot", "🥕"], ["beet", "🥕"],
    ["carrot", "🥕"], ["carrots", "🥕"],
    ["radish", "🥕"], ["radishes", "🥕"],
    ["potato", "🥔"], ["potatoes", "🥔"], ["jyothi", "🥔"],
    ["onion", "🧅"], ["onions", "🧅"],
    ["tomato", "🍅"], ["tomatoes", "🍅"],
    ["pumpkin", "🎃"], ["pumpkins", "🎃"],
    ["chow chow", "🥒"], ["chayote", "🥒"],
    ["tinda", "🥒"], ["tindas", "🥒"],
    ["raw banana", "🍌"], ["raw papaya", "🍈"],
    
    // Leafy Vegetables
    ["coriander leaves", "🌿"], ["coriander", "🌿"], ["kothambari", "🌿"],
    ["mint leaves", "🌿"], ["mint", "🌿"], ["pudina", "🌿"],
    ["fenugreek leaves", "🌿"], ["fenugreek", "🌿"], ["menthya", "🌿"],
    ["dill leaves", "🌿"], ["dill", "🌿"], ["shepu", "🌿"],
    ["amaranthus", "🌿"], ["harive", "🌿"],
    ["basale soppu", "🌿"], ["colocasia leaves", "🌿"], ["kasave", "🌿"],
    ["gongura", "🌿"], ["palak", "🌿"], ["spinach", "🌿"],
    
    // Bakery - Specific items first
    ["pineapple pastry", "🍍"], ["custard pastry", "🍮"],
    ["fruit cake", "🍰"], ["plum cake", "🍰"],
    ["cream roll", "🥐"], ["croissant", "🥐"],
    ["burger bun", "🍞"], ["hot dog bun", "🍞"],
    ["khari biscuit", "🍪"], ["rusk", "🍞"],
    ["muffin", "🧁"], ["cup cake", "🧁"], ["cupcake", "🧁"],
    ["pastry", "🥐"], ["pastries", "🥐"],
    ["custard", "🍮"], ["custards", "🍮"],
    ["cake", "🍰"], ["cakes", "🍰"],
    ["bread", "🍞"], ["breads", "🍞"], ["bun", "🍞"], ["pav", "🍞"], ["toast", "🍞"],
    ["cookie", "🍪"], ["cookies", "🍪"], ["biscuit", "🍪"],
    ["donut", "🍩"], ["donuts", "🍩"],
    
    // Crackers/Fireworks - Specific first
    ["flower pot", "🎆"], ["flower pots", "🎆"],
    ["electric sparklers", "🪔"], ["crackling sparklers", "🪔"],
    ["aerial jumbo shooters", "🚀"], ["aerial turbo shooters", "🚀"],
    ["combo pack", "🎆"], ["celebration products", "🎆"],
    ["rainbow smoke", "💨"], ["money bank", "💰"],
    ["firework", "🎆"], ["fireworks", "🎆"],
    ["sparkler", "🪔"], ["sparklers", "🪔"],
    ["cracker", "🧨"], ["crackers", "🧨"],
    ["spark", "✨"], ["sparks", "✨"],
    ["rocket", "🚀"], ["shooters", "🚀"],
    
    // Flowers - Specific first
    ["sujee mallige", "🌼"], ["kanakambara", "🌼"], ["kakada", "🌼"],
    ["jajee", "🌼"], ["ganere", "🌼"], ["ganagile", "🌼"], ["sevanthige", "🌼"],
    ["sunflower", "🌻"], ["sunflowers", "🌻"],
    ["mallige", "🌼"], ["malliges", "🌼"], ["jasmine", "🌸"], ["jasmines", "🌸"],
    ["lotus", "🪷"], ["lotuses", "🪷"],
    ["rose", "🌹"], ["roses", "🌹"], ["gulabi", "🌹"],
    ["flower", "💐"], ["flowers", "💐"], ["bouquet", "💐"],
    
    // Dairy & Milk Products
    ["toned milk", "🥛"], ["double toned milk", "🥛"], ["full cream milk", "🥛"],
    ["a2 cow milk", "🥛"], ["flavoured milk", "🥛"],
    ["curd", "🥛"], ["yogurt", "🥛"], ["yoghurt", "🥛"], ["majjige", "🥛"],
    ["ice cream", "🍦"], ["icecream", "🍦"],
    ["butter", "🧈"], ["butters", "🧈"],
    ["cheese", "🧀"], ["cheeses", "🧀"],
    ["milk", "🥛"], ["milks", "🥛"],
    
    // Proteins
    ["chicken", "🍗"], ["chickens", "🍗"],
    ["egg", "🥚"], ["eggs", "🥚"],
    ["fish", "🐟"], ["fishes", "🐟"],
    ["meat", "🥩"], ["meats", "🥩"],
    
    // Staples/Groceries - Specific first
    ["sona masuri", "🍚"], ["basmati rice", "🍚"], ["brown rice", "🍚"],
    ["wheat flour", "🌾"], ["ragi flour", "🌾"], ["jowar flour", "🌾"], ["maida", "🌾"],
    ["toor dal", "🫘"], ["moong dal", "🫘"], ["chana dal", "🫘"], ["urad dal", "🫘"], ["masoor dal", "🫘"],
    ["sunflower oil", "🫒"], ["groundnut oil", "🫒"], ["coconut oil", "🫒"], ["mustard oil", "🫒"],
    ["turmeric powder", "🧂"], ["chilli powder", "🧂"], ["coriander powder", "🧂"],
    ["garam masala", "🧂"], ["sambar powder", "🧂"], ["rasam powder", "🧂"],
    ["tea powder", "🍵"], ["coffee powder", "☕"],
    ["poha", "🍚"], ["avalakki", "🍚"],
    ["vermicelli", "🍜"], ["shavige", "🍜"],
    ["noodles", "🍜"], ["pasta", "🍝"],
    ["papad", "🍘"], ["happala", "🍘"],
    ["breakfast cereal", "🥣"], ["cereal", "🥣"],
    ["jaggery", "🍬"], ["bella", "🍬"],
    ["rice", "🍚"], ["rices", "🍚"],
    ["wheat", "🌾"], ["wheats", "🌾"],
    ["lentil", "🫘"], ["lentils", "🫘"],
    ["dal", "🫘"], ["dals", "🫘"],
    ["sugar", "🍬"], ["sugars", "🍬"], ["sakkare", "🍬"],
    ["salt", "🧂"], ["salts", "🧂"], ["uppu", "🧂"],
    ["oil", "🫒"], ["oils", "🫒"], ["enne", "🫒"],
    
    // Beverages
    ["coffee", "☕"], ["coffees", "☕"], ["kafi", "☕"],
    ["juice", "🧃"], ["juices", "🧃"],
    ["tea", "🍵"], ["teas", "🍵"], ["chaha", "🍵"],
    ["water", "💧"], ["waters", "💧"],
    
    // Other Groceries
    ["soap", "🧼"], ["soaps", "🧼"],
    
    // Services (fallback icons)
    ["consultation", "📋"], ["consultancy", "📋"], ["tax", "📋"],
    ["plumbing", "🔧"], ["plumber", "🔧"],
    ["electrician", "⚡"], ["wiring", "⚡"], ["fan", "⚡"],
    ["carpenter", "🪚"], ["furniture", "🪚"],
    ["cleaning", "🧹"], ["deep cleaning", "🧹"],
    ["pest control", "🐛"], ["cockroach", "🐛"], ["termite", "🐛"], ["mosquito", "🐛"],
    ["ac service", "❄️"], ["ro service", "💧"], ["geyser", "💧"],
    ["pet", "🐾"], ["dog", "🐕"], ["cat", "🐈"], ["veterinary", "🐾"], ["grooming", "✂️"],
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



