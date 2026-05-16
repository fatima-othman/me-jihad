/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../services/api';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/authService';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);
const LAST_LOGIN_KEY_PREFIX = 'strategai_last_login_at_';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback((nextUser) => {
    if (!nextUser) {
      storage.removeUser();
      setUser(null);
      return null;
    }

    const mergedUser = { ...(storage.getUser() || {}), ...nextUser };
    storage.setUser(mergedUser);
    setUser(mergedUser);
    return mergedUser;
  }, []);

  const clearSession = useCallback(() => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!storage.getToken()) {
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      syncUser(currentUser);
      return currentUser;
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
      }
      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const existingToken = storage.getToken();
      if (!existingToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        await fetchCurrentUser();
      } catch {
        // Interceptor + context already handle session cleanup if needed.
      } finally {
        if (isMounted) {
          setToken(storage.getToken());
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      const { token: newToken, user: newUser } = await loginUser(credentials);

      if (!newToken) {
        throw { message: 'Login response did not include an access token.', fieldErrors: {} };
      }

      storage.setToken(newToken);
      setToken(newToken);

      if (newUser) {
        syncUser(newUser);
        const key = `${LAST_LOGIN_KEY_PREFIX}${newUser.id || newUser.email || 'guest'}`;
        localStorage.setItem(key, new Date().toISOString());
      } else {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          const key = `${LAST_LOGIN_KEY_PREFIX}${currentUser.id || currentUser.email || 'guest'}`;
          localStorage.setItem(key, new Date().toISOString());
        }
      }

      return { token: newToken, user: newUser };
    },
    [fetchCurrentUser],
  );

  const register = useCallback(
    async (payload) => {
      const { token: newToken, user: newUser } = await registerUser(payload);

      if (newToken) {
        storage.setToken(newToken);
        setToken(newToken);
      }

      if (newUser) {
        syncUser(newUser);
        return { token: newToken, user: newUser };
      }

      if (newToken) {
        await fetchCurrentUser();
      }

      return { token: newToken, user: newUser };
    },
    [fetchCurrentUser],
  );

  const logout = useCallback(async () => {
    const hasToken = Boolean(storage.getToken());

    if (hasToken) {
      try {
        await logoutUser();
      } catch {
        // Clear local session regardless of API response.
      }
    }

    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      register,
      refreshUser: fetchCurrentUser,
      syncUser,
    }),
    [fetchCurrentUser, loading, login, logout, register, syncUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
