import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboardPage />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;