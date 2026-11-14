import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on init
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const { authApi } = await import('../api/auth.js');
    const response = await authApi.login({ username, password });

    if (response.requires2FA) {
      setPendingToken(response.pendingToken);
      setRequires2FA(true);
      return { requires2FA: true };
    }

    setToken(response.token);
    localStorage.setItem('adminToken', response.token);
    const meResponse = await authApi.me(response.token);
    setAdmin(meResponse);
    return { requires2FA: false };
  }, []);

  const verify2FA = useCallback(async (totpCode, useBackupCode = false) => {
    if (!pendingToken) throw new Error('No pending token');

    const { authApi } = await import('../api/auth.js');
    const response = await authApi.verify2FA(pendingToken, totpCode, useBackupCode);

    setToken(response.token);
    localStorage.setItem('adminToken', response.token);
    setPendingToken(null);
    setRequires2FA(false);

    const meResponse = await authApi.me(response.token);
    setAdmin(meResponse);
  }, [pendingToken]);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    setPendingToken(null);
    setRequires2FA(false);
    localStorage.removeItem('adminToken');
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        pendingToken,
        requires2FA,
        loading,
        login,
        verify2FA,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}