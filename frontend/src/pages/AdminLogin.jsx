import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useNotify } from '../components/NotificationProvider';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  if (sessionStorage.getItem('adminToken')) return <Navigate to="/admin" replace />;

  async function signIn(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      sessionStorage.setItem('adminToken', data.token);
      sessionStorage.setItem('adminProfile', JSON.stringify(data.admin));
      navigate('/admin', { replace: true });
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page page-container">
      <section className="login-card">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to CampusCare</Link>
        <div className="login-card__icon"><LockKeyhole size={21} /></div>
        <span className="section-index">ADMINISTRATOR ACCESS</span>
        <h1>Welcome back.</h1>
        <p>Sign in to review reports and keep campus services moving.</p>
        <form onSubmit={signIn}>
          <label className="field">
            <span>Work email</span>
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength="254" placeholder="you@campus.edu" />
          </label>
          <label className="field">
            <span>Password</span>
            <span className="password-input">
              <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength="128" placeholder="Enter your password" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <button className="button button--primary button--large button--wide" disabled={loading}>
            {loading ? <><span className="spinner spinner--light" />Signing in</> : <>Sign in to dashboard <ArrowRight size={17} /></>}
          </button>
        </form>
        <div className="login-card__secure"><ShieldCheck size={16} /><span>Protected administrator access</span></div>
      </section>
      <aside className="login-aside">
        <div className="login-aside__top"><span className="login-aside__seal">C</span><span>CAMPUSCARE / STAFF</span></div>
        <div className="login-aside__content">
          <span className="section-index">BETTER CAMPUS, TOGETHER</span>
          <h2>Every report<br />is a chance to<br /><em>make it better.</em></h2>
          <p>One clear view of the issues, the people, and the next step.</p>
        </div>
        <div className="login-aside__footer"><span><span /> Secure sign-in</span><span>Campus services, connected</span></div>
      </aside>
    </div>
  );
}
