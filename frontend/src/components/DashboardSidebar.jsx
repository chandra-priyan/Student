import { LayoutDashboard, ClipboardList, Clock3, RefreshCw, CircleCheck, LogOut, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminSession } from './AdminSessionContext';

const navigation = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { key: 'all', label: 'All complaints', icon: ClipboardList, to: '/admin?view=all' },
  { key: 'Pending', label: 'Pending', icon: Clock3, to: '/admin?status=Pending' },
  { key: 'In Progress', label: 'In progress', icon: RefreshCw, to: '/admin?status=In%20Progress' },
  { key: 'Resolved', label: 'Resolved', icon: CircleCheck, to: '/admin?status=Resolved' },
];

export default function DashboardSidebar({ adminEmail, activeKey, open, onClose }) {
  const { signOut } = useAdminSession();

  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close dashboard navigation" onClick={onClose} />}
      <aside className={`dashboard-sidebar${open ? ' dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-sidebar__brand">
          <Link to="/" className="brand" onClick={onClose}>
            <span className="brand__mark brand__mark--type">C</span>
            <span>Campus<span className="brand__accent">Care</span><small>ADMIN CONSOLE</small></span>
          </Link>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close dashboard navigation"><X size={18} /></button>
        </div>
        <span className="sidebar-section-label">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Admin dashboard navigation">
          {navigation.map(({ key, label, icon: Icon, to }) => (
            <Link
              key={key}
              className={`sidebar-link${activeKey === key ? ' sidebar-link--active' : ''}`}
              to={to}
              aria-current={activeKey === key ? 'page' : undefined}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {key === 'Pending' && <span className="sidebar-link__indicator" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-help">
          <span className="sidebar-help__spark">✦</span>
          <strong>CampusCare desk</strong>
          <p>Keeping campus services moving, one report at a time.</p>
        </div>
        <div className="sidebar-account">
          <span className="dashboard-profile__avatar">{(adminEmail || 'A').charAt(0).toUpperCase()}</span>
          <span className="sidebar-account__details"><strong>{adminEmail || 'Administrator'}</strong><small>Campus administrator</small></span>
          <button className="icon-button sidebar-logout" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>
    </>
  );
}
