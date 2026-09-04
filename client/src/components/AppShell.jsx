import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, Bell, CalendarDays, CheckSquare,
  Dumbbell, Flag, HeartPulse, Home, LogOut, Medal, Settings, Sparkles, Wallet
} from 'lucide-react';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Habits', to: '/habits', icon: HeartPulse },
  { label: 'NutriAI', to: '/nutrition', icon: Sparkles },
  { label: 'Fitness', to: '/fitness', icon: Dumbbell },
  { label: 'Expenses', to: '/expense', icon: Wallet },
  { label: 'Achievements', to: '/achievements', icon: Medal },
  { label: 'Level & XP', to: '/dashboard#xp', icon: Flag },
  { label: 'Statistics', to: '/stats', icon: BarChart3 },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/dashboard#settings', icon: Settings }
];

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell min-h-screen">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Sparkles size={20} /></div>
          <div><strong>LIFE</strong><strong>LEVELLING</strong></div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">{user?.username?.slice(0, 1).toUpperCase() || 'V'}</div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{user?.username || 'Player'}</p>
            <p className="text-xs text-slate-400">Level {user?.level || 1} • {user?.title || 'Novice'}</p>
            <div className="mt-2 h-1 rounded-full bg-slate-800"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" /></div>
            <p className="mt-1 text-[10px] text-slate-500">{user?.xp || 0} XP</p>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Log out" aria-label="Log out"><LogOut size={14} /></button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Notifications' && <span className="notification-dot">1</span>}
            </NavLink>
          ))}
        </nav>

      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
};