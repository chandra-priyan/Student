import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  return sessionStorage.getItem('adminToken')
    ? children
    : <Navigate to="/admin/login" replace />;
}
