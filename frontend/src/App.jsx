import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './components/NotificationProvider';
import StudentPortal from './pages/StudentPortal';
import ComplaintSubmission from './pages/ComplaintSubmission';
import TrackComplaint from './pages/TrackComplaint';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <NotificationProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/submit" element={<ComplaintSubmission />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </NotificationProvider>
  );
}
