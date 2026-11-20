import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, ClipboardList, RefreshCw, RotateCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { categories, getErrorMessage } from '../services/api';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import ComplaintTable from '../components/ComplaintTable';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import FilterDropdown from '../components/FilterDropdown';
import StatCard from '../components/StatCard';
import { useNotify } from '../components/NotificationProvider';

const emptyStats = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In progress' },
  { value: 'Resolved', label: 'Resolved' },
];
const categoryOptions = [
  { value: '', label: 'All categories' },
  ...categories.map((category) => ({ value: category, label: category })),
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [complaints, setComplaints] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [filters, setFilters] = useState({ q: '', category: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [admin, setAdmin] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeStatus = searchParams.get('status') || '';
  const showAllView = searchParams.get('view') === 'all';

  useEffect(() => {
    try {
      setAdmin(JSON.parse(sessionStorage.getItem('adminProfile') || '{}'));
    } catch {
      setAdmin({});
    }
  }, []);

  useEffect(() => {
    setFilters((current) => ({ ...current, status: routeStatus }));
  }, [routeStatus]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100, page: 1 };
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const [list, summary] = await Promise.all([
        api.get('/complaints', { params }),
        api.get('/complaints/stats'),
      ]);
      setComplaints(list.data.complaints);
      setResultCount(list.data.pagination.total);
      setStats(summary.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/admin/login', { replace: true });
      else notify(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, navigate, notify]);

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, filters.q ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard, filters.q]);

  const statCards = useMemo(() => [
    { title: 'Total complaints', value: stats.total, tone: 'navy', icon: ClipboardList, status: '' },
    { title: 'Pending complaints', value: stats.pending, tone: 'orange', icon: Clock3, status: 'Pending' },
    { title: 'In progress', value: stats.inProgress, tone: 'blue', icon: RefreshCw, status: 'In Progress' },
    { title: 'Resolved', value: stats.resolved, tone: 'green', icon: CheckCircle2, status: 'Resolved' },
  ], [stats]);

  function chooseStatus(status) {
    setFilters((current) => ({ ...current, status }));
    setSearchParams(status ? { status } : { view: 'all' });
  }

  async function updateStatus(status) {
    if (!selected || status === selected.status) return;
    setUpdating(true);
    try {
      await api.patch(`/complaints/${selected.complaintId}/status`, { status });
      notify('Complaint status updated.');
      await loadDashboard();
      const { data } = await api.get(`/complaints/${selected.complaintId}`);
      setSelected(data.complaint);
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function deleteComplaint() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/complaints/${deleteTarget.complaintId}`);
      if (selected?.complaintId === deleteTarget.complaintId) setSelected(null);
      setDeleteTarget(null);
      notify('Complaint deleted.');
      await loadDashboard();
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setDeleting(false);
    }
  }

  const activeKey = filters.status || (showAllView ? 'all' : 'dashboard');
  const heading = filters.status ? `${filters.status} complaints` : showAllView ? 'All complaints' : 'Dashboard overview';

  return (
    <div className="admin-layout">
      <DashboardSidebar
        adminEmail={admin.email}
        activeKey={activeKey}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="admin-main">
        <DashboardHeader
          adminEmail={admin.email}
          query={filters.q}
          onQueryChange={(q) => setFilters((current) => ({ ...current, q }))}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="dashboard-body">
          <div className="dashboard-section-heading">
            <div><span className="section-index">CAMPUS SERVICE OVERVIEW</span><h2>{heading}</h2><p>A clear view of reports and the next step for each one.</p></div>
          </div>
          <section className="stats-grid" aria-label="Complaint statistics">
            {statCards.map((card) => (
              <StatCard
                {...card}
                key={card.title}
                active={card.status === filters.status && (!card.status || !showAllView)}
                onClick={() => chooseStatus(card.status)}
              />
            ))}
          </section>

          <section className="table-card" aria-labelledby="complaint-table-title">
            <div className="table-card__heading">
              <div><h2 id="complaint-table-title">Complaint management</h2><p>Review reports, follow up, and update their status.</p></div>
              <div className="table-card__tools">
                <span className="result-count">{resultCount} {resultCount === 1 ? 'report' : 'reports'}</span>
                <button className="button button--secondary button--compact" onClick={loadDashboard} disabled={loading}><RotateCw size={15} className={loading ? 'spin-once' : ''} />Refresh</button>
              </div>
            </div>
            <div className="filters">
              <FilterDropdown label="Filter by category" value={filters.category} options={categoryOptions} onChange={(category) => setFilters((current) => ({ ...current, category }))} />
              <FilterDropdown label="Filter by status" value={filters.status} options={statusOptions} onChange={chooseStatus} />
            </div>
            <ComplaintTable complaints={complaints} loading={loading} onView={setSelected} />
            <div className="table-card__foot">
              <span>Showing {complaints.length} of {resultCount} reports</span>
              <span>Complaint details are visible only to administrators.</span>
            </div>
          </section>
        </div>
      </main>
      {selected && (
        <ComplaintDetailsModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
          onDelete={() => setDeleteTarget(selected)}
          updating={updating}
        />
      )}
      {deleteTarget && (
        <ConfirmationDialog
          title="Delete this complaint?"
          message={`Complaint ${deleteTarget.complaintId} will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete complaint"
          busy={deleting}
          onConfirm={deleteComplaint}
          onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
