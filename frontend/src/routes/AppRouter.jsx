import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminRoutes from './NestedRoutes';

// Legacy Queue Pages
import JoinQueuePage from '@/pages/JoinQueuePage';
import UserStatusPage from '@/pages/UserStatusPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

// Hospital Pages
import SystemSelector from '@/pages/SystemSelector';
import PatientLogin from '@/pages/patient/PatientLogin';
import PatientRegister from '@/pages/patient/PatientRegister';
import PatientDashboard from '@/pages/patient/PatientDashboard';
import BookAppointment from '@/pages/patient/BookAppointment';
import HospitalAdminDashboard from '@/pages/admin/HospitalAdminDashboard';


const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Patient Routes */}
        <Route path="/" element={
          isAuthenticated && user?.role === 'patient' ? <Navigate to="/dashboard" replace /> : <PatientLogin />
        } />
        <Route path="/login" element={
          isAuthenticated && user?.role === 'patient' ? <Navigate to="/dashboard" replace /> : <PatientLogin />
        } />
        <Route path="/register" element={
          isAuthenticated && user?.role === 'patient' ? <Navigate to="/dashboard" replace /> : <PatientRegister />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/book-appointment" element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        } />

        {/* Legacy Queue Routes */}
        <Route path="/queue" element={<JoinQueuePage />} />
        <Route path="/join" element={<Navigate to="/queue" replace />} />
        <Route path="/status/:ticketId" element={<UserStatusPage />} />
        <Route path="/ticket/:ticketId" element={<Navigate to="/status/:ticketId" replace />} />
        


        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated && user?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <AdminLoginPage />
          } 
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <HospitalAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/legacy"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;