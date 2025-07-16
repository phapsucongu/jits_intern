import { createContext, useContext, useState, useEffect } from 'react';
import api from '../instance/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token validity on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Set token in API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Set current user with the token we have
    setCurrentUser({ token });
    
    // We'll check if it's valid, but we already set currentUser to prevent flicker
    const validateToken = async () => {
      try {
        // Try to access products as a simple validation request
        await api.get('/api/auth/products');
        console.log('Token validated successfully');
        // Token is valid, currentUser is already set
      } catch (err) {
        console.error('Token validation failed:', err);
        // Token is invalid, remove it
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    validateToken();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/api/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser({ token });
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
      throw err;
    }
  };

  const register = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/api/register', { email, password });
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
