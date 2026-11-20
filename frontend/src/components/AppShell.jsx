import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Menu, X } from 'lucide-react';
import api from '../services/api';
import { useNotify } from './NotificationProvider';
import { AdminSessionContext } from './AdminSessionContext';
import campusMark from '../assets/campus-mark.svg';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const signedIn = Boolean(sessionStorage.getItem('adminToken'));
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      notify('Your local session was cleared; the server could not confirm sign-out.', 'error');
    }
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminProfile');
    setMenuOpen(false);
    navigate('/');
  }, [navigate, notify]);
  const session = useMemo(() => ({ signOut }), [signOut]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <AdminSessionContext.Provider value={session}>
      <div className="app-shell">
        <header className="topbar">
          <Link className="brand" to="/" aria-label="CampusCare home">
            <img className="brand__mark" src={campusMark} alt="" />
            <span>Campus<span className="brand__accent">Care</span><small>SMART CAMPUS SERVICES</small></span>
          </Link>
          <button
            className="icon-button mobile-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav id="primary-navigation" className={`topnav${menuOpen ? ' topnav--open' : ''}`} aria-label="Main navigation">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/submit">Submit a complaint</NavLink>
            <NavLink to="/track">Track complaint</NavLink>
            {signedIn ? (
              <>
                <NavLink className="topnav__admin" to="/admin">Admin dashboard <ArrowRight size={15} /></NavLink>
                <button className="button button--nav" onClick={signOut}><LogOut size={15} /> Sign out</button>
              </>
            ) : (
              <NavLink className="topnav__admin" to="/admin/login">Admin sign in <ArrowRight size={15} /></NavLink>
            )}
          </nav>
        </header>
        <main className="page-content">{children}</main>
        <footer className="site-footer">
          <span>CampusCare <span aria-hidden="true">·</span> A better campus starts with being heard.</span>
          <span>Student services portal</span>
        </footer>
      </div>
    </AdminSessionContext.Provider>
  );
}
