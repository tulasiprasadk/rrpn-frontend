import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./ExploreItem.css";

export default function ExploreItem({ icon, title, titleKannada, desc, descKannada, longInfo, longInfoKannada }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  function handleEnter(e) {
    const rect = e.currentTarget.getBoundingClientRect();

    setPopupPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 20 // popup above the card
    });

    setShowPopup(true);
  }

  function handleLeave() {
    setShowPopup(false);
  }

  return (
    <div
      className="explore-card"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="explore-icon">{icon}</span>
      <h3 className="explore-title">{title}</h3>
      <div className="explore-title-kannada" style={{ color: '#c8102e', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{titleKannada}</div>
      <p className="explore-desc">{desc}</p>
      <div className="explore-desc-kannada" style={{ color: '#c8102e', fontSize: 13, fontWeight: 500 }}>{descKannada}</div>

      {showPopup &&
        ReactDOM.createPortal(
          <div
            className="explore-popup-portal"
            style={{
              position: "fixed",
              left: popupPos.x,
              top: popupPos.y,
            }}
          >
            <div className="popup-title">{title} <span style={{ color: '#c8102e', fontWeight: 600, fontSize: 15 }}>{titleKannada}</span></div>
            <div className="popup-body">{longInfo}<br /><span style={{ color: '#c8102e', fontSize: 14, fontWeight: 500 }}>{longInfoKannada}</span></div>
          </div>,
          document.body
        )}
    </div>
  );
}
