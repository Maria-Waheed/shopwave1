import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sw_auth'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) localStorage.setItem('sw_auth', JSON.stringify(auth));
    else localStorage.removeItem('sw_auth');
  }, [auth]);

  // Validate a stored session once on startup.
  useEffect(() => {
    if (!auth) return;
    api.getMe(auth.accessToken).catch((e) => {
      if (e.status === 401 || e.status === 403) setAuth(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    setAuth(data);
    return data;
  };
  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ user: auth, token: auth?.accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
