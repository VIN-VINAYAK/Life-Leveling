import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Flame, Swords } from 'lucide-react';
import { Card3D } from '../components/ui/Card3D';
import { useLanguage } from '../context/LanguageContext';

export const Register = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError(t('All fields are required'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('Password must be at least 6 characters'));
      return;
    }

    setLoading(true);
    const result = await register(formData.username, formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(t(result.error));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page min-h-screen flex items-center justify-center p-4">
      <div className="auth-theme-toggle"><ThemeToggle compact /></div>
      <Card3D className="auth-card w-full max-w-md">
        <div className="auth-crest" aria-hidden="true"><Flame size={18} /><Swords size={18} /></div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Life Leveling</h1>
        <p className="text-center text-gray-600 mb-8">{t('Create your account')}</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">{t('Username')}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder={t('Choose a username')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">{t('Email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder={t('your@email.com')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">{t('Password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder={t('••••••')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">{t('Confirm Password')}</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder={t('••••••')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? t('Creating account...') : t('Register')}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">
            {t('Login')}
          </Link>
        </p>
      </Card3D>
    </div>
  );
};
