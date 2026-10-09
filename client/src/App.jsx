import React, { Suspense, lazy, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './context/XPContext';
import { AppShell } from './components/AppShell';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider } from './context/ThemeContext';
import { PageTransition } from './components/ui/PageTransition';
import { PageSkeleton } from './components/ui/Skeleton';
import { LanguageProvider } from './context/LanguageContext';

const Login = lazy(() => import('./pages/Login.jsx').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register.jsx').then((module) => ({ default: module.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then((module) => ({ default: module.Dashboard })));
const Habits = lazy(() => import('./pages/Habits.jsx').then((module) => ({ default: module.Habits })));
const Achievements = lazy(() => import('./pages/Achievements.jsx').then((module) => ({ default: module.Achievements })));
const Notifications = lazy(() => import('./pages/Notifications.jsx').then((module) => ({ default: module.Notifications })));
const Stats = lazy(() => import('./pages/Stats.jsx').then((module) => ({ default: module.Stats })));
const Calendar = lazy(() => import('./pages/Calendar.jsx').then((module) => ({ default: module.Calendar })));
const Tasks = lazy(() => import('./pages/Tasks.jsx').then((module) => ({ default: module.Tasks })));
const Nutrition = lazy(() => import('./pages/Nutrition.jsx').then((module) => ({ default: module.Nutrition })));
const Fitness = lazy(() => import('./pages/Fitness.jsx').then((module) => ({ default: module.Fitness })));
const Expense = lazy(() => import('./pages/Expense.jsx').then((module) => ({ default: module.Expense })));
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx').then((module) => ({ default: module.Leaderboard })));
const Summary = lazy(() => import('./pages/Summary.jsx').then((module) => ({ default: module.Summary })));
const Settings = lazy(() => import('./pages/Settings.jsx').then((module) => ({ default: module.Settings })));
const PublicPlayer = lazy(() => import('./pages/PublicPlayer.jsx').then((module) => ({ default: module.PublicPlayer })));

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </Suspense>
    </AppShell>
  );
};

const PublicPage = ({ children }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
);

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicPage><Login /></PublicPage>} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PublicPage><Register /></PublicPage>} />
      <Route path="/player/:id" element={<PublicPage><PublicPlayer /></PublicPage>} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/tasks" element={<Tasks />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LanguageProvider>
            <AuthProvider>
              <XPProvider>
                <AppRoutes />
                <AnimatePresence>
                  {showSplash && (
                    <SplashScreen
                      key="splash-screen"
                      onComplete={() => setShowSplash(false)}
                    />
                  )}
                </AnimatePresence>
              </XPProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </ThemeProvider>
    </MotionConfig>
  );
}

export default App;
