import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search complaints…', label = 'Search complaints', className = '' }) {
  return (
    <label className={`search-field ${className}`}>
      <Search size={17} aria-hidden="true" />
      <input
        aria-label={label}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
