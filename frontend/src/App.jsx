import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import OpeningPage from './components/pages/OpeningPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import OTPVerificationPage from './components/auth/OTPVerificationPage';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Users from './pages/Users';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Subscriptions from './pages/Subscriptions';
import Logs from './pages/Logs';
import CompanyDetails from './pages/CompanyDetails';
import Settings from './pages/Settings';
import ManagerDashboard from './pages/ManagerDashboard';

const getDefaultDashboardPath = (role) => {
  if (role === 'manager') {
    return '/manager/dashboard';
  }
  return '/admin/dashboard';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{
          border: '4px solid #f0f2f5',
          borderTop: '4px solid #0066cc',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultDashboardPath(user.role)} replace />;
  }

  return children;
};

const AppContent = () => {
  const { token, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<OpeningPageWrapper />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route
        path="/dashboard"
        element={
          token && user
            ? <Navigate to={getDefaultDashboardPath(user.role)} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Companies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <CompanyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Subscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Logs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Manager Route */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin', 'superadmin']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const OpeningPageWrapper = () => {
  const navigate = useNavigate();

  return (
    <OpeningPage
      onGetStarted={() => navigate('/login')}
      onLogin={() => navigate('/login')}
      onRegister={() => navigate('/register')}
    />
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
