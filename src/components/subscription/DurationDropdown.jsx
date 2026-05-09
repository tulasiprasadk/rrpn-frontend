export default function DurationDropdown({ value, options, onChange, disabled = false }) {
  return (
    <div>
      <div className="subscription-popup__label">Duration</div>
      <select
        className="subscription-popup__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
