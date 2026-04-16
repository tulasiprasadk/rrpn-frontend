import ExpandablePlanDetails from "./ExpandablePlanDetails";

export default function GroceryPlanSelector({
  value,
  plans,
  onChange,
  expanded,
  onToggleExpanded,
  selectedPlan,
  onQuantityChange
}) {
  return (
    <div className="subscription-popup__card">
      <div className="subscription-popup__section-title">Ration plan</div>
      <div className="subscription-popup__section-subtitle">
        Pick one plan first, then expand only if you want to review or adjust quantities.
      </div>
      <select
        className="subscription-popup__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {plans.map((plan) => (
          <option key={plan.value} value={plan.value}>
            {plan.label} {plan.badge ? `| ${plan.badge}` : ""}
          </option>
        ))}
      </select>
      {selectedPlan && (
        <>
          <div className="subscription-popup__pill-row">
            <span className="subscription-popup__pill">{selectedPlan.badge}</span>
            <span className="subscription-popup__pill">Includes essentials bundle</span>
          </div>
          <ExpandablePlanDetails
            open={expanded}
            onToggle={onToggleExpanded}
            items={selectedPlan.items}
            onQuantityChange={onQuantityChange}
          />
        </>
      )}
    </div>
  );
}
