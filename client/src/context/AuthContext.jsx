import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mosaic_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mosaic_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('mosaic_token');
      const storedUser = localStorage.getItem('mosaic_user');
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setToken(storedToken);
          // Attempt silent validation/sync
          const res = await authAPI.getMe();
          if (res?.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('mosaic_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Silent session validation fallback:', err);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res?.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('mosaic_token', res.data.token);
        localStorage.setItem('mosaic_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      const failMsg = res?.data?.message || 'Failed to sign in. Please verify credentials.';
      setError(failMsg);
      return { success: false, message: failMsg };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sign in. Please verify credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authAPI.register(userData);
      if (res?.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('mosaic_token', res.data.token);
        localStorage.setItem('mosaic_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      const failMsg = res?.data?.message || 'Registration failed. Please check your details.';
      setError(failMsg);
      return { success: false, message: failMsg };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('mosaic_token');
    localStorage.removeItem('mosaic_user');
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('mosaic_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
