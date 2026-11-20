import { CalendarDays, Menu, Search } from 'lucide-react';

export default function DashboardHeader({ adminEmail, query, onQueryChange, onMenuClick }) {
  const firstName = adminEmail?.split('@')[0] || 'Administrator';

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__welcome">
        <button className="icon-button dashboard-menu-toggle" onClick={onMenuClick} aria-label="Open dashboard navigation">
          <Menu size={20} />
        </button>
        <div>
          <span className="eyebrow"><span className="eyebrow__dot" /> CAMPUSCARE / ADMINISTRATION</span>
          <h1>Good morning, {firstName}<span>.</span></h1>
          <p>Here’s what’s happening across your campus.</p>
        </div>
      </div>
      <div className="dashboard-header__tools">
        <label className="dashboard-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search by complaint ID or student name"
            placeholder="Search ID or student…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <span className="dashboard-date"><CalendarDays size={16} />{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <div className="dashboard-profile">
          <span className="dashboard-profile__avatar">{firstName.charAt(0).toUpperCase()}</span>
          <span className="dashboard-profile__details"><strong>{firstName}</strong><small>Administrator</small></span>
        </div>
      </div>
    </header>
  );
}
