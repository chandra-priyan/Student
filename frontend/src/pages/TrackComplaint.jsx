import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Check, Circle, Search, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const stages = ['Pending', 'In Progress', 'Resolved'];

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const findComplaint = useCallback(async (idValue) => {
    const id = idValue.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setSearched(true);
    setErrorMessage('');
    setComplaint(null);
    try {
      const { data } = await api.get(`/complaints/track/${encodeURIComponent(id)}`);
      setComplaint(data.complaint);
    } catch (error) {
      setErrorMessage(error.response?.status === 404
        ? 'We couldn’t find a complaint with that ID. Check it and try again.'
        : getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setComplaintId(id);
      findComplaint(id);
    }
  }, [findComplaint, searchParams]);

  function submitSearch(event) {
    event.preventDefault();
    findComplaint(complaintId);
  }

  const currentStage = complaint ? stages.indexOf(complaint.status) : -1;

  return (
    <div className="track-page page-container">
      <header className="track-hero">
        <span className="eyebrow"><span className="eyebrow__dot" /> COMPLAINT TRACKER</span>
        <h1>Stay in the <span>loop.</span></h1>
        <p>Every report has a path forward. Enter your complaint ID to see the latest update.</p>
        <form className="track-search" onSubmit={submitSearch}>
          <label htmlFor="complaint-id">Complaint ID</label>
          <div className="track-search__row">
            <div className="track-search__input"><Search size={18} /><input id="complaint-id" value={complaintId} onChange={(event) => setComplaintId(event.target.value)} placeholder="e.g. SC-2026-A1B2C3D4" required /></div>
            <button className="button button--primary button--large" type="submit" disabled={loading}>
              {loading ? <><span className="spinner spinner--light" />Searching</> : <>Find my report <ArrowRight size={17} /></>}
            </button>
          </div>
          <small>Your complaint ID was shown after you submitted your report.</small>
        </form>
        <div className="track-privacy"><ShieldCheck size={16} /><span>Your personal details are never shown in public tracking.</span></div>
      </header>

      {loading && <Spinner label="Finding your complaint" />}
      {!loading && errorMessage && (
        <EmptyState title="We couldn’t find that report" description={errorMessage} icon={Search} />
      )}
      {!loading && complaint && (
        <section className="tracking-card" aria-labelledby="tracking-title">
          <div className="tracking-card__header">
            <div><span className="section-index">COMPLAINT REFERENCE</span><h2 id="tracking-title">{complaint.complaintId}</h2></div>
            <StatusBadge status={complaint.status} />
          </div>
          <div className="tracking-card__meta">
            <div><span>Category</span><strong>{complaint.category}</strong></div>
            <div><span>Submitted</span><strong>{new Date(complaint.createdAt).toLocaleString()}</strong></div>
            <div><span>Last updated</span><strong>{new Date(complaint.updatedAt).toLocaleString()}</strong></div>
          </div>
          <div className="progress-tracker" aria-label={`Complaint progress: ${complaint.status}`}>
            {stages.map((stage, index) => {
              const complete = index < currentStage;
              const active = index === currentStage;
              return (
                <div className={`progress-step${complete ? ' progress-step--complete' : ''}${active ? ' progress-step--active' : ''}`} key={stage}>
                  <span className="progress-step__marker">{complete ? <Check size={14} /> : active ? <span /> : <Circle size={12} />}</span>
                  <span className="progress-step__label">{stage}</span>
                </div>
              );
            })}
          </div>
          <p className="tracking-card__privacy"><ShieldCheck size={15} /> For privacy, complaint details and student information are only available to campus administrators.</p>
        </section>
      )}
      {!searched && (
        <div className="track-help">
          <span className="track-help__icon"><Search size={18} /></span>
          <div><strong>Where can I find my complaint ID?</strong><p>It was displayed after you submitted your report. Complaint IDs are not case-sensitive.</p></div>
          <Link className="text-link" to="/submit">Raise a report <ArrowRight size={15} /></Link>
        </div>
      )}
    </div>
  );
}
