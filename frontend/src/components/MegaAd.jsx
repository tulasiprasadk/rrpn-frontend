import React from "react";
import "./MegaAd.css";

export default function MegaAd({ image, link, alt = "Ad", children, position = "left" }) {
  const fallback = "/images/ads/rrnagar.png";
  const handleError = (e) => {
    if (e && e.currentTarget && e.currentTarget.src && !e.currentTarget.dataset.fallback) {
      e.currentTarget.dataset.fallback = "1";
      e.currentTarget.src = fallback;
    }
  };

  return (
    <div className={`mega-ad mega-ad-${position}`}>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {image ? <img src={image} alt={alt} loading="lazy" onError={handleError} /> : children}
        </a>
      ) : image ? (
        <img src={image} alt={alt} loading="lazy" onError={handleError} />
      ) : (
        children
      )}
    </div>
  );
}



