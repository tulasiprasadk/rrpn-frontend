import "./DiscoverPopup.css";
import { useEffect, useState } from "react";

// The anchorRef is a ref to the ExploreItem DOM node
export default function DiscoverPopup({ item, onClose, anchorRef, onMouseEnter, onMouseLeave }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!item || !anchorRef?.current) {
      setRect(null);
      return;
    }

    const r = anchorRef.current.getBoundingClientRect();
    setRect(r);

    function handleResize() {
      if (anchorRef?.current) setRect(anchorRef.current.getBoundingClientRect());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [item, anchorRef]);

  if (!item || !rect) return null;

  const popupWidth = 320;
  const popupHeight = 180;
  // center above the anchor by default
  let left = rect.left + rect.width / 2 - popupWidth / 2;
  let top = rect.top - popupHeight - 12; // 12px gap above the card

  // clamp horizontally within viewport with small margin
  const margin = 8;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  if (left < margin) left = margin;
  if (left + popupWidth + margin > vw) left = Math.max(margin, vw - popupWidth - margin);

  // if there's not enough space above, place below the anchor
  if (top < margin) {
    top = rect.bottom + 12; // place below
  }

  return (
    <div className="discover-popup-absolute" style={{ left, top, width: popupWidth, position: "fixed", zIndex: 10001 }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="discover-popup" onClick={(e) => e.stopPropagation()}>
        <h2>
          {item.icon} {item.title}
        </h2>
        <h4>{item.titleKannada}</h4>
        <p>{item.longInfo}</p>
        <p className="kn">{item.longInfoKannada}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}



