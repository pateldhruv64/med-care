import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosConfig';
import LoadingFallback from '../components/common/LoadingFallback';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem('token')),
  );

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setUser(data);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/users/register', userData);
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, updateUser }}
    >
      {loading ? <LoadingFallback /> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
