import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as apiLogin } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
