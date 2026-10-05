import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { ModalDrawer } from './ui/ModalDrawer';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3, Bell, CalendarDays, CheckSquare,
  Dumbbell, Flag, Flame, HeartPulse, Home, LogOut, Medal, MoreHorizontal, Settings, Sparkles, Swords, Wallet
} from 'lucide-react';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Habits', to: '/habits', icon: HeartPulse },
  { label: 'NutriAI', to: '/nutrition', icon: Sparkles },
  { label: 'Fitness', to: '/fitness', icon: Dumbbell },
  { label: 'Expenses', to: '/expense', icon: Wallet },
  { label: 'Achievements', to: '/achievements', icon: Medal },
  { label: 'Leaderboard', to: '/leaderboard', icon: Flag },
  { label: 'Statistics', to: '/stats', icon: BarChart3 },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings }
];
const primaryNavigation = navigation.slice(0, 5);
const secondaryNavigation = navigation.slice(5);

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMoreOpen(false);
    navigate('/login');
  };

  const navLink = ({ label, to, icon: Icon }, mobile = false) => (
    <NavLink
      key={`${mobile ? 'mobile-' : ''}${label}`}
      to={to}
      onClick={() => mobile && setMoreOpen(false)}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}${mobile ? ' mobile-tab' : ''}`}
      aria-label={mobile ? label : undefined}
    >
      <Icon size={mobile ? 19 : 16} strokeWidth={1.8} />
      <span>{t(label)}</span>
      {label === 'Notifications' && <span className="notification-dot">1</span>}
    </NavLink>
  );

  return (
    <div className="app-shell min-h-screen">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Flame size={18} /></div>
          <div><strong>LIFE</strong><strong>LEVELLING</strong></div>
          <div className="sidebar-crest" aria-hidden="true"><Swords size={15} /></div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">{user?.username?.slice(0, 1).toUpperCase() || 'V'}</div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{user?.username || 'Player'}</p>
            <p className="text-xs text-slate-400">{t('Level')} {user?.level || 1} · {t(user?.title || 'Novice')}</p>
            <div className="sidebar-xp-track"><span /></div>
            <p className="mt-1 text-[10px] text-slate-500">{user?.xp || 0} XP</p>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title={t('Log out')} aria-label={t('Log out')}><LogOut size={15} /></button>
        </div>

        <div className="sidebar-tools">
          <span>{t('APPEARANCE')}</span>
          <ThemeToggle />
        </div>

        <nav className="sidebar-nav" aria-label={t('Main navigation')}>
          {navigation.map((item) => navLink(item))}
        </nav>
      </aside>

      <main className="app-content">{children}</main>

      <nav className="mobile-tabbar" aria-label={t('Primary navigation')}>
        {primaryNavigation.map((item) => navLink(item, true))}
        <button type="button" className={`sidebar-link mobile-tab${moreOpen ? ' active' : ''}`} onClick={() => setMoreOpen(true)} aria-label={t('More navigation')}>
          <MoreHorizontal size={19} />
          <span>{t('More')}</span>
        </button>
      </nav>

      <ModalDrawer open={moreOpen} onClose={() => setMoreOpen(false)} title={t('More')} side="bottom">
        <div className="mobile-more-links">{secondaryNavigation.map((item) => navLink(item, true))}</div>
        <div className="mobile-more-tools">
          <div className="mobile-more-user">
            <span className="profile-avatar">{user?.username?.slice(0, 1).toUpperCase() || 'V'}</span>
            <span><strong>{user?.username || t('Player')}</strong><small>{t('Level')} {user?.level || 1} · {user?.xp || 0} XP</small></span>
          </div>
          <ThemeToggle />
          <button className="secondary-button" onClick={handleLogout}><LogOut size={16} /> {t('Log out')}</button>
        </div>
      </ModalDrawer>
    </div>
  );
};
