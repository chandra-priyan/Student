import { ChevronDown } from 'lucide-react';

export default function FilterDropdown({ label, value, options, onChange }) {
  return (
    <label className="filter-dropdown">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown size={15} aria-hidden="true" />
    </label>
  );
}
