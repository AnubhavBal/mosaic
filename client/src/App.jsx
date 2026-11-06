import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { JourneyProvider } from './context/JourneyContext.jsx';
import MobileLayout from './layouts/MobileLayout.jsx';

import HomeDashboard from './pages/HomeDashboard.jsx';
import DailyCheckin from './pages/DailyCheckin.jsx';
import WeeklyReflection from './pages/WeeklyReflection.jsx';
import ReflectionsList from './pages/ReflectionsList.jsx';
import Timeline from './pages/Timeline.jsx';
import PhotoComparison from './pages/PhotoComparison.jsx';
import JourneysPage from './pages/JourneysPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-primary)',
        fontSize: '14px',
        fontWeight: 600,
      }}>
        Loading your wellness journey...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Only Route Component (redirects logged in users to dashboard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <JourneyProvider>
          <Routes>
            {/* Wrap all views in MobileLayout to enforce the 430px mobile shell constraint on desktop */}
            <Route element={<MobileLayout />}>
              {/* Public Auth Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

              {/* Protected App Routes */}
              <Route path="/" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
              <Route path="/checkin" element={<ProtectedRoute><DailyCheckin /></ProtectedRoute>} />
              <Route path="/reflection/new" element={<ProtectedRoute><WeeklyReflection /></ProtectedRoute>} />
              <Route path="/reflections" element={<ProtectedRoute><ReflectionsList /></ProtectedRoute>} />
              <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
              <Route path="/comparison" element={<ProtectedRoute><PhotoComparison /></ProtectedRoute>} />
              <Route path="/journeys" element={<ProtectedRoute><JourneysPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </JourneyProvider>
      </AuthProvider>
    </HashRouter>
  );
}
