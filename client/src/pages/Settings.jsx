import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Activity, Clock3, Globe2, KeyRound, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { GlassCard } from '../components/ui/GlassCard';
import { PageSkeleton } from '../components/ui/Skeleton';

const activityLabels = {
  sign_in: 'Successful sign-in',
  account_created: 'Account created',
  account_updated: 'Account details updated',
  password_changed: 'Password changed'
};
const changedFieldLabels = { username: 'Username', email: 'Email address', language: 'App language' };

export const Settings = () => {
  const { fetchCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [settings, setSettings] = useState({ username: '', email: '', language: 'en', createdAt: null });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const refreshActivity = async () => {
    try {
      const response = await settingsAPI.getActivity();
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not load your account activity.'));
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([settingsAPI.get(), settingsAPI.getActivity()])
      .then(([settingsResponse, activityResponse]) => {
        if (!active) return;
        setSettings(settingsResponse.data.settings);
        setEvents(activityResponse.data.events || []);
      })
      .catch((error) => {
        if (active) toast.error(t(error.response?.data?.message || 'Could not load your settings.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [t]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await settingsAPI.update(settings);
      setSettings(response.data.settings);
      setLanguage(response.data.settings.language);
      await fetchCurrentUser();
      toast.success(t('Your settings have been saved.'));
      await refreshActivity();
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not save your settings.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('The new passwords do not match.'));
      return;
    }
    setSavingPassword(true);
    try {
      await settingsAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('Your password has been changed.'));
      await refreshActivity();
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not change your password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    if (!window.confirm(t('This permanently deletes your account and all associated data. This cannot be undone.'))) return;

    setDeletingAccount(true);
    try {
      await settingsAPI.deleteAccount(deletePassword);
      window.alert(t('Your account has been deleted.'));
      logout();
      navigate('/register', { replace: true });
    } catch (error) {
      toast.error(t(error.response?.data?.message || 'Could not delete your account.'));
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <main className="settings-page">
      <Toaster position="top-right" />
      <header className="settings-heading">
        <p className="section-eyebrow"><UserRound size={15} /> {t('YOUR ACCOUNT')}</p>
        <h1>{t('Settings')}</h1>
        <p>{t('Manage your profile, language, appearance, and account security.')}</p>
      </header>

      <div className="settings-grid">
        <div className="settings-main-column">
          <GlassCard className="settings-card">
            <div className="settings-card-heading">
              <span><UserRound size={18} /></span>
              <div><h2>{t('Account details')}</h2><p>{t('Update the name and email linked to your account.')}</p></div>
            </div>
            <form className="settings-form" onSubmit={saveProfile}>
              <label>{t('Username')}
                <input value={settings.username} onChange={(event) => setSettings({ ...settings, username: event.target.value })} minLength={3} maxLength={24} autoComplete="username" required />
              </label>
              <label>{t('Email address')}
                <input type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} autoComplete="email" required />
              </label>
              <label className="settings-language-field"><span><Globe2 size={15} /> {t('App language')}</span>
                <select value={settings.language || language} onChange={(event) => setSettings({ ...settings, language: event.target.value })}>
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </label>
              <button className="primary-button settings-submit" type="submit" disabled={savingProfile}>
                {savingProfile ? t('Saving…') : t('Save changes')}
              </button>
            </form>
          </GlassCard>

          <GlassCard className="settings-card">
            <div className="settings-card-heading">
              <span><KeyRound size={18} /></span>
              <div><h2>{t('Password & security')}</h2><p>{t('Choose a password you do not use elsewhere.')}</p></div>
            </div>
            <form className="settings-form" onSubmit={savePassword}>
              <label>{t('Current password')}
                <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} autoComplete="current-password" required />
              </label>
              <label>{t('New password')}
                <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength={6} maxLength={128} autoComplete="new-password" required />
              </label>
              <label>{t('Confirm new password')}
                <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength={6} maxLength={128} autoComplete="new-password" required />
              </label>
              <button className="secondary-button settings-submit" type="submit" disabled={savingPassword}>
                {savingPassword ? t('Updating…') : t('Update password')}
              </button>
            </form>
          </GlassCard>

          <GlassCard className="settings-card settings-delete-card">
            <div className="settings-card-heading">
              <span><Trash2 size={18} /></span>
              <div><h2>{t('Delete account')}</h2><p>{t('Permanently remove your account and personal data.')}</p></div>
            </div>
            <form className="settings-form" onSubmit={deleteAccount}>
              <label>{t('Confirm your password')}
                <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" required />
              </label>
              <button className="danger-button settings-submit" type="submit" disabled={deletingAccount}>
                {deletingAccount ? t('Deleting…') : t('Delete my account')}
              </button>
              <p className="settings-delete-warning">{t('This action is permanent and cannot be undone.')}</p>
            </form>
          </GlassCard>
        </div>

        <div className="settings-side-column">
          <GlassCard className="settings-card settings-appearance">
            <div className="settings-card-heading">
              <span><Globe2 size={18} /></span>
              <div><h2>{t('Appearance')}</h2><p>{t('Choose how Life Levelling looks on this device.')}</p></div>
            </div>
            <div className="settings-appearance-row"><div><strong>{t('Color theme')}</strong><small>{t('Switch between dark and light')}</small></div><ThemeToggle /></div>
          </GlassCard>

          <GlassCard className="settings-card settings-activity">
            <div className="settings-card-heading">
              <span><ShieldCheck size={18} /></span>
              <div><h2>{t('Account activity')}</h2><p>{t('Recent sign-ins and security-related changes.')}</p></div>
            </div>
            {events.length ? (
              <ol className="settings-activity-list">
                {events.map((entry) => (
                  <li key={entry._id}>
                    <span className="settings-activity-icon"><Activity size={15} /></span>
                    <div>
                      <strong>{t(activityLabels[entry.type] || entry.summary)}</strong>
                      {entry.type === 'account_updated' && entry.summary.startsWith('Updated ') && (
                        <span className="settings-activity-detail">
                          {t('Changed')}: {entry.summary.slice(8).split(', ').map((field) => t(changedFieldLabels[field] || field)).join(', ')}
                        </span>
                      )}
                      <small><Clock3 size={12} /> {new Date(entry.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="settings-activity-empty">{t('Your account events will appear here.')}</p>
            )}
          </GlassCard>

          <GlassCard className="settings-account-meta">
            <span className="settings-account-meta__icon"><UserRound size={17} /></span>
            <div><small>{t('MEMBER SINCE')}</small><strong>{settings.createdAt ? new Date(settings.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' }) : t('Recently')}</strong></div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
};
