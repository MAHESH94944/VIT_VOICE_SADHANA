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

  // New: Google login flow
  const loginWithGoogle = async ({ idToken, role, counsellorName }) => {
    // send idToken to backend; backend may respond { needRole: true, email, name }
    const resp = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken, role, counsellorName }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.message || "Google login failed");
    }
    // If backend indicates role is required, return that info so UI can prompt
    if (data.needRole) {
      return { needRole: true, email: data.email, name: data.name };
    }
    // successful login -> refresh user state
    await refresh();
    return { success: true };
  };

  const logout = async () => {
    try {
      await logoutUser();
      await refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      await refresh();
    }
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, logout, refresh, loginWithGoogle }),
    [user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
