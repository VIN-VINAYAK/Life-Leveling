import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './context/XPContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Habits } from './pages/Habits';
import { Achievements } from './pages/Achievements';
import { Notifications } from './pages/Notifications';
import { Stats } from './pages/Stats';
import { Calendar } from './pages/Calendar';

const Nutrition = lazy(() => import('./pages/Nutrition.jsx').then((module) => ({ default: module.Nutrition })));
const Fitness = lazy(() => import('./pages/Fitness.jsx').then((module) => ({ default: module.Fitness })));
const Expense = lazy(() => import('./pages/Expense.jsx').then((module) => ({ default: module.Expense })));
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx').then((module) => ({ default: module.Leaderboard })));
const Summary = lazy(() => import('./pages/Summary.jsx').then((module) => ({ default: module.Summary })));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Nutrition />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fitness"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Fitness />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expense"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Expense />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Leaderboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/summary"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Summary />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/habits"
        element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <Achievements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <Stats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <XPProvider>
          <AppRoutes />
        </XPProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
