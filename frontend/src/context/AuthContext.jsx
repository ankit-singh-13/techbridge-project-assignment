import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);
const rolePermissions = {
  admin: ['manage-users', 'manage-projects', 'manage-tests', 'execute-tests', 'view'],
  'test-lead': ['manage-projects', 'manage-tests', 'execute-tests', 'view'],
  tester: ['execute-tests', 'view'],
  'read-only': ['view']
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const can = useCallback((permission) => Boolean(user && rolePermissions[user.role]?.includes(permission)), [user]);
  const value = useMemo(() => ({ user, login, logout, can, permissions: user ? rolePermissions[user.role] : [] }), [user, login, logout, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
