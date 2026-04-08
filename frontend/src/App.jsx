import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Pages
import OpeningPage from './components/pages/OpeningPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import OTPVerificationPage from './components/auth/OTPVerificationPage';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ManagerDashboard from './pages/ManagerDashboard';
import UserHome from './pages/user/UserHome';
import UserJobProfiles from './pages/user/UserJobProfiles';
import UserProfile from './pages/user/UserProfile';
import UserInterviews from './pages/user/UserInterviews';
import UserAssessments from './pages/user/UserAssessments';
import UserEvents from './pages/user/UserEvents';
import UserCompetitions from './pages/user/UserCompetitions';
import UserResume from './pages/user/UserResume';
import UserHelp from './pages/user/UserHelp';

const getDefaultDashboardPath = (role) => {
  if (['admin', 'superadmin'].includes(role)) {
    return '/admin/dashboard';
  }

  if (['manager', 'company_manager'].includes(role)) {
    return '/manager/dashboard';
  }

  return '/user/home';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <div
          style={{
            border: '4px solid #f0f2f5',
            borderTop: '4px solid #0066cc',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
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
        element={token && user ? <Navigate to={getDefaultDashboardPath(user.role)} replace /> : <Navigate to="/login" replace />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/openings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Dashboard />
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
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Users />
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
          <ProtectedRoute allowedRoles={['manager', 'company_manager', 'admin', 'superadmin']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/user/home"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/job-profiles"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserJobProfiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/my-profile"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/interviews"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserInterviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/assessments"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserAssessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/events"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/competitions"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserCompetitions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/resume"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserResume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/help"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserHelp />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={token && user ? <Navigate to={getDefaultDashboardPath(user.role)} replace /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
};

const OpeningPageWrapper = () => {
  const navigate = useNavigate();

  return (
    <OpeningPage
      onLogin={() => navigate('/login')}
      onRegister={() => navigate('/register')}
    />
  );
};

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}
