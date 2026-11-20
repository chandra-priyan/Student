import { CircleAlert, CircleCheck, X } from 'lucide-react';

export default function ToastNotification({ notice, onDismiss }) {
  const Icon = notice.type === 'error' ? CircleAlert : CircleCheck;

  return (
    <div className={`toast toast--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
      <Icon className="toast__icon" size={20} aria-hidden="true" />
      <span className="toast__message">{notice.message}</span>
      <button className="icon-button toast__close" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={17} />
      </button>
    </div>
  );
}
