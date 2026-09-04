import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!token);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Check if user is logged in on mount
  useEffect(() => {
    let isActive = true;

    const loadUser = async () => {
      if (!token) {
        if (isActive) setLoading(false);
        return;
      }
      try {
        const response = await authAPI.getCurrentUser();
        if (isActive) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (isActive) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isActive = false;
    };
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.register(username, email, password);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message
        || (error.request ? 'Unable to reach the server. Make sure the backend is running on port 5000.' : 'Login failed');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
