import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import authService, {
  clearSession,
  getStoredUser,
} from "../services/authService";
import { getToken } from "../services/http";
import { STORAGE_KEYS } from "../config/api";
import {
  isAdminRole,
  isWorkerRole,
  normalizeUser,
} from "../utils/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setAuthToken] = useState(() => getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || String(token).startsWith("demo.")) return undefined;

    let active = true;
    authService
      .me()
      .then((data) => {
        if (!active) return;
        const nextUser = normalizeUser(
          data?.data?.user || data?.user || data?.data || data
        );
        if (!nextUser) return;
        setUser(nextUser);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          clearSession();
          setUser(null);
          setAuthToken(null);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const session = await authService.login(credentials);
      setUser(session.user);
      setAuthToken(session.token);
      return session;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const result = await authService.register(payload);
      setUser(result.user || getStoredUser());
      setAuthToken(getToken());
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAuthToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(user && isAdminRole(user.role)),
      isWorker: Boolean(user && isWorkerRole(user.role)),
      isSuperAdmin: Boolean(user && user.role === "superadmin"),
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
