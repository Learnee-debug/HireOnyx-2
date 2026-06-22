import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.auth.me()
      .then(({ profile: prof }) => { setUser(prof); setProfile(prof); })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    try {
      const { token, profile: prof } = await api.auth.login({ email, password });
      setToken(token);
      setUser(prof);
      setProfile(prof);
      return { profile: prof };
    } catch (err) {
      return { error: { message: err.message } };
    }
  }

  async function signup(email, password, fullName, role) {
    try {
      const { token, profile: prof } = await api.auth.signup({ email, password, fullName, role });
      setToken(token);
      setUser(prof);
      setProfile(prof);
      return { user: prof };
    } catch (err) {
      return { error: { message: err.message } };
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
