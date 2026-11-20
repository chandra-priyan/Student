import { CircleCheck, CircleDot, Clock3 } from 'lucide-react';

export default function StatusBadge({ status }) {
  const modifier = status.toLowerCase().replace(/\s+/g, '-');
  const Icon = status === 'Resolved' ? CircleCheck : status === 'In Progress' ? CircleDot : Clock3;
  return <span className={`status-badge status-badge--${modifier}`}><Icon size={13} strokeWidth={2.2} />{status}</span>;
}
