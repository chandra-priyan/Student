import { AlertTriangle } from 'lucide-react';

export default function ConfirmationDialog({ title, message, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop modal-backdrop--top" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <span className="confirm-dialog__icon"><AlertTriangle size={21} /></span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{message}</p>
        <div className="confirm-dialog__actions">
          <button className="button button--secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="button button--danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
