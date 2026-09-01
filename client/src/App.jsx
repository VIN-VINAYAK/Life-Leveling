import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
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
      <div className="page-shell flex items-center justify-center">
        <div className="card-surface w-full max-w-md p-8 text-center soft-ring">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-primary-100" />
          <p className="text-xl font-semibold text-slate-700">Loading your world...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RouteFade = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="w-full"
  >
    {children}
  </motion.div>
);

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
            <RouteFade>
              <Dashboard />
            </RouteFade>
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-shell flex items-center justify-center"><div className="card-surface w-full max-w-md p-8 text-center"><p className="text-slate-600">Loading nutrition dashboard...</p></div></div>}>
              <RouteFade>
                <Nutrition />
              </RouteFade>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fitness"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-shell flex items-center justify-center"><div className="card-surface w-full max-w-md p-8 text-center"><p className="text-slate-600">Loading fitness dashboard...</p></div></div>}>
              <RouteFade>
                <Fitness />
              </RouteFade>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expense"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-shell flex items-center justify-center"><div className="card-surface w-full max-w-md p-8 text-center"><p className="text-slate-600">Loading expense dashboard...</p></div></div>}>
              <RouteFade>
                <Expense />
              </RouteFade>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-shell flex items-center justify-center"><div className="card-surface w-full max-w-md p-8 text-center"><p className="text-slate-600">Loading leaderboard...</p></div></div>}>
              <RouteFade>
                <Leaderboard />
              </RouteFade>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/summary"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-shell flex items-center justify-center"><div className="card-surface w-full max-w-md p-8 text-center"><p className="text-slate-600">Loading summary...</p></div></div>}>
              <RouteFade>
                <Summary />
              </RouteFade>
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
