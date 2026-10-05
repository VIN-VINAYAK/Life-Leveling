import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const label = t(`Switch to ${isDark ? 'light' : 'dark'} theme`);

  return (
    <button
      type="button"
      className={`theme-toggle${compact ? ' theme-toggle--compact' : ''}`}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      {!compact && <span>{t(isDark ? 'Light mode' : 'Dark mode')}</span>}
    </button>
  );
};