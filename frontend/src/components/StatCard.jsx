import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, tone, onClick, active = false }) {
  return (
    <button
      className={`stat-card stat-card--${tone}${active ? ' stat-card--active' : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="stat-card__icon"><Icon size={19} strokeWidth={1.9} /></span>
      <span className="stat-card__content">
        <span className="stat-card__label">{title}</span>
        <strong className="stat-card__value">{value}</strong>
        <span className="stat-card__hint">View complaints <ArrowUpRight size={13} /></span>
      </span>
    </button>
  );
}
