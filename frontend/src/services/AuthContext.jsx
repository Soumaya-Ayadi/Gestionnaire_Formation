import { createContext, useContext, useState, useEffect } from 'react';
import api from './api.jsx';

const AuthContext = createContext(null);

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = parseJwtPayload(token);
  return !payload || !payload.exp || payload.exp * 1000 < Date.now();
};

const clearSession = () => {
  localStorage.clear();
};
// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const login = localStorage.getItem('login');
    if (token && !isTokenExpired(token)) {
      return { token, role, login };
    }
    clearSession();
    return null;
  });

  // Check token expiration every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        signOut();
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const signIn = async (login, password) => {
    const { data } = await api.post('/auth/login', { login, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role',  data.role);
    localStorage.setItem('login', data.login);
    setUser(data);
  };

  const signOut = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
