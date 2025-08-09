import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { loginUser, logoutUser, getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setUser(res?.user || null);
    } catch (err) {
      console.error("Session refresh failed:", err);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    await loginUser({ email, password });
    await refresh();
  };

  const logout = async () => {
    try {
      await logoutUser();
      await refresh(); // Re-check auth state to confirm logout
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout API fails, force a refresh to sync state
      await refresh();
    }
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, logout, refresh }),
    [user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
