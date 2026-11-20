import { useEffect } from 'react';
import { CalendarDays, Tag, UserRound, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ComplaintDetailsModal({ complaint, onClose, onStatusChange, onDelete, updating }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header className="detail-modal__head">
          <div><span className="section-index">COMPLAINT DETAILS</span><h2 id="detail-title">{complaint.complaintId}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close complaint details"><X size={19} /></button>
        </header>
        <div className="detail-modal__summary">
          <StatusBadge status={complaint.status} />
          <span>Submitted {new Date(complaint.createdAt).toLocaleString()}</span>
        </div>
        <div className="detail-modal__grid">
          <div><span><UserRound size={15} /> Student</span><strong>{complaint.studentName}</strong></div>
          <div><span><Tag size={15} /> Category</span><strong>{complaint.category}</strong></div>
          <div><span><CalendarDays size={15} /> Department</span><strong>{complaint.department}</strong></div>
        </div>
        <div className="detail-description"><span>DESCRIPTION</span><p>{complaint.description}</p></div>
        <label className="field detail-status">
          <span>Update complaint status</span>
          <select value={complaint.status} disabled={updating} onChange={(event) => onStatusChange(event.target.value)}>
            <option>Pending</option><option>In Progress</option><option>Resolved</option>
          </select>
        </label>
        <footer className="detail-modal__actions">
          <button className="button button--danger-quiet" onClick={onDelete}>Delete complaint</button>
          <button className="button button--secondary" onClick={onClose}>Done</button>
        </footer>
      </section>
    </div>
  );
}
