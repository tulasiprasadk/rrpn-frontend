export default function UpsellMultiSelect({ title, subtitle, items, selectedIds, onToggle }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="subscription-popup__card">
      <div className="subscription-popup__section-title">{title}</div>
      {subtitle && <div className="subscription-popup__section-subtitle">{subtitle}</div>}
      <div className="subscription-popup__upsell-grid">
        {items.map((item) => {
          const active = selectedIds.includes(item.id);
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onToggle(item)}
              className={`subscription-popup__upsell-item${active ? " is-active" : ""}`}
            >
              <div className="subscription-popup__upsell-title">{item.title}</div>
              <div className="subscription-popup__upsell-price">Rs {Number(item.price || 0).toFixed(2)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
