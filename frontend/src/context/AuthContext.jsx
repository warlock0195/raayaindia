import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useMemo(
    () => Boolean(localStorage.getItem("raaya_access_token") && user),
    [user]
  );

  const hydrateUser = async () => {
    const token = localStorage.getItem("raaya_access_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authApi.profile();
      setUser(profile);
    } catch {
      localStorage.removeItem("raaya_access_token");
      localStorage.removeItem("raaya_refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const register = async (payload) => {
    await authApi.register(payload);
  };

  const login = async (payload) => {
    const tokens = await authApi.login(payload);
    const access = tokens?.access;
    const refresh = tokens?.refresh;

    if (access) {
      localStorage.setItem("raaya_access_token", access);
    }
    if (refresh) {
      localStorage.setItem("raaya_refresh_token", refresh);
    }

    await hydrateUser();
  };

  const logout = () => {
    localStorage.removeItem("raaya_access_token");
    localStorage.removeItem("raaya_refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
