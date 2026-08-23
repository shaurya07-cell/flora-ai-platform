import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('flora_auth_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize Axios authorization header when token changes
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('flora_auth_token', token);
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('flora_auth_token');
    }
  }, [token]);

  // Check current session on initial render
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('flora_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const res = await axiosInstance.get('/auth/me');
        if (res.data?.success && res.data?.data) {
          setUser(res.data.data);
          setToken(storedToken);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session expired or server offline. Resetting local auth state.');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await axiosInstance.post('/auth/register', { name, email, password });
    if (res.data?.success && res.data?.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error?.message || 'Registration failed');
  };

  const adminLogin = async (email, password) => {
    const res = await axiosInstance.post('/auth/admin/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error?.message || 'Admin login failed');
  };

  const getOAuthConfig = async () => {
    const res = await axiosInstance.get('/auth/oauth/config');
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
    return { googleConfigured: false, githubConfigured: false, googleClientId: null, githubClientId: null };
  };

  const googleOAuth = async (userProfile) => {
    const res = await axiosInstance.post('/auth/oauth/google', { userProfile });
    if (res.data?.success && res.data?.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error?.message || 'Google OAuth failed');
  };

  const githubOAuth = async (userProfile) => {
    const res = await axiosInstance.post('/auth/oauth/github', { userProfile });
    if (res.data?.success && res.data?.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.error?.message || 'GitHub OAuth failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('flora_auth_token');
  };

  const adminLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('flora_auth_token');
  };

  const updateUser = (userData) => {
    setUser(prev => (prev ? { ...prev, ...userData } : userData));
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        adminLogin,
        googleOAuth,
        githubOAuth,
        getOAuthConfig,
        logout,
        adminLogout,
        updateUser
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
