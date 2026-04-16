export default function ExpandablePlanDetails({ open, onToggle, items, onQuantityChange }) {
  return (
    <div className="subscription-popup__expandable">
      <button type="button" onClick={onToggle} className="subscription-popup__expand-toggle">
        {open ? "Hide plan items" : "View plan items"}
      </button>
      {open && (
        <div className="subscription-popup__plan-items">
          {items.map((item) => (
            <div key={item.key || item.title} className="subscription-popup__plan-row">
              <div>
                <div className="subscription-popup__plan-title">{item.title}</div>
                <div className="subscription-popup__plan-meta">
                  Rs {Number(item.unitPrice || 0).toFixed(2)} per {item.unit || "unit"}
                </div>
              </div>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => onQuantityChange(item.key || item.title, event.target.value)}
                className="subscription-popup__qty-input"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
