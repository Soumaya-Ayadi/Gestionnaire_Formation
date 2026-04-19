import React, { createContext, useContext, useState } from 'react';
import api from './api.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const login = localStorage.getItem('login');
    return token ? { token, role, login } : null;
  });

  const signIn = async (login, password) => {
    const { data } = await api.post('/auth/login', { login, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role',  data.role);
    localStorage.setItem('login', data.login);
    setUser(data);
  };

  const signOut = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
