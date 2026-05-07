import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get("auth/profile/");
        setUser({
          username: res.data.user,
          role: res.data.role,
        });
      } catch (err) {
       
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data) => {
    try {
      if (data) {
        await api.post("auth/login/", data);
      }
      
      const res = await api.get("auth/profile/");
      setUser({
        username: res.data.user,
        role: res.data.role,
      });

      return { role: res.data.role };
    } catch (err) {
      throw err;
    }
  }, []);

  const googleLogin = useCallback(async (token) => {
    try {
      await api.post("auth/google-login/", { token });
      return await login();
    } catch (err) {
      throw err;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await api.post("auth/logout/");
    } catch (err) {
      // Silently handle logout failure
    } finally {
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};