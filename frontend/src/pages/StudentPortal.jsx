import { useEffect, useState } from 'react';
import { ArrowRight, Check, Clock3, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { getRecentComplaintIds } from '../services/recentComplaints';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import { useNotify } from '../components/NotificationProvider';

const steps = [
  { number: '01', title: 'Tell us what’s wrong', description: 'Share the details and we’ll route your report to the right campus team.', icon: FileText },
  { number: '02', title: 'We’re on it', description: 'Your report is reviewed and the right team takes action.', icon: Clock3 },
  { number: '03', title: 'See the difference', description: 'Follow every update with your personal complaint ID.', icon: Check },
];

export default function StudentPortal() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    const ids = getRecentComplaintIds();
    if (ids.length === 0) return undefined;

    let active = true;
    setLoading(true);
    Promise.allSettled(ids.map((id) => api.get(`/complaints/track/${id}`).then(({ data }) => data.complaint)))
      .then((results) => {
        if (!active) return;
        const complaints = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);
        setRecent(complaints);
        const failed = results.find((result) => result.status === 'rejected');
        if (failed) notify(getErrorMessage(failed.reason), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [notify]);

  return (
    <div className="student-home page-container">
      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="eyebrow"><span className="eyebrow__dot" /> YOUR CAMPUS, IN GOOD HANDS</span>
          <h1>A better campus<br />starts with <span>being heard.</span></h1>
          <p>One place to raise an issue, follow its progress, and help make everyday campus life better.</p>
          <div className="home-hero__actions">
            <Link className="button button--primary button--large" to="/submit">Raise a complaint <ArrowRight size={17} /></Link>
            <Link className="button button--secondary button--large" to="/track">Track a complaint</Link>
          </div>
          <div className="home-trust"><ShieldCheck size={17} /><span>Your personal details are only visible to campus administrators.</span></div>
        </div>
        <div className="home-illustration" aria-label="Illustration of the campus service office">
          <div className="home-illustration__sun" />
          <div className="home-illustration__card home-illustration__card--top"><span><Check size={14} /></span><div><strong>Report received</strong><small>CampusCare is on it</small></div></div>
          <div className="home-illustration__building">
            <div className="home-illustration__roof" />
            <div className="home-illustration__windows"><i /><i /><i /><i /><i /><i /></div>
            <div className="home-illustration__door" />
          </div>
          <div className="home-illustration__tree home-illustration__tree--left" />
          <div className="home-illustration__tree home-illustration__tree--right" />
          <div className="home-illustration__card home-illustration__card--bottom"><Sparkles size={16} /><span>Small fixes. Better days.</span></div>
        </div>
      </section>

      <section className="home-section process-section">
        <div className="section-heading">
          <div><span className="section-index">SIMPLE BY DESIGN</span><h2>From report to resolution.</h2></div>
          <p>Campus services, without the back-and-forth.</p>
        </div>
        <div className="process-grid">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article className="process-card" key={number}>
              <span className="process-card__icon"><Icon size={20} /></span>
              <span className="process-card__number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section activity-section">
        <div className="section-heading">
          <div><span className="section-index">YOUR REPORTS</span><h2>Recent activity</h2></div>
          <Link className="text-link" to="/track">Track a complaint <ArrowRight size={15} /></Link>
        </div>
        {loading ? <Spinner label="Loading your recent reports" /> : recent.length ? (
          <div className="activity-list">
            {recent.map((complaint) => (
              <Link className="activity-row" to={`/track?id=${complaint.complaintId}`} key={complaint.complaintId}>
                <span className="activity-row__icon"><FileText size={18} /></span>
                <span className="activity-row__details"><strong>{complaint.category}</strong><small>{complaint.complaintId} · Submitted {new Date(complaint.createdAt).toLocaleDateString()}</small></span>
                <StatusBadge status={complaint.status} />
                <ArrowRight className="activity-row__arrow" size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Your reports will show up here"
            description="Once you submit a complaint, you can quickly pick up where you left off."
            action={<Link className="text-link" to="/submit">Submit your first report <ArrowRight size={15} /></Link>}
          />
        )}
      </section>
    </div>
  );
}
