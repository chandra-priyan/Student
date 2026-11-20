import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import Spinner from './Spinner';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ComplaintTable({ complaints, loading, onView }) {
  if (loading) return <Spinner label="Loading complaints" />;
  if (complaints.length === 0) {
    return <EmptyState title="No complaints found" description="Try changing your search or filters to find what you’re looking for." />;
  }

  return (
    <div className="table-scroll">
      <table className="complaint-table">
        <thead>
          <tr>
            <th scope="col">Complaint</th>
            <th scope="col">Student</th>
            <th scope="col">Category</th>
            <th scope="col">Submitted</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint._id}>
              <td data-label="Complaint">
                <button className="table-id" onClick={() => onView(complaint)}>{complaint.complaintId}</button>
                <small>View report</small>
              </td>
              <td data-label="Student"><strong className="student-name">{complaint.studentName}</strong><small>{complaint.department}</small></td>
              <td data-label="Category"><span className="category-chip">{complaint.category}</span></td>
              <td data-label="Submitted">{formatDate(complaint.createdAt)}</td>
              <td data-label="Status"><StatusBadge status={complaint.status} /></td>
              <td data-label="Actions">
                <button className="icon-button table-action" aria-label={`View ${complaint.complaintId}`} onClick={() => onView(complaint)}>
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
