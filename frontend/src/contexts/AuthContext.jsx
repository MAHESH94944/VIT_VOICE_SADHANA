import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginUser, logoutUser, getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setUser(res?.user || null);
    } catch (err) {
      console.error("Session refresh failed:", err);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email, password) => {
    await loginUser({ email, password });
    await refresh();
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, logout, refresh }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
