import { createContext, useContext, useState, useEffect } from 'react';
import api from '../instance/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  // Verify token validity on mount and load user permissions
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
    
    // We'll check if it's valid and load user data including permissions
    const validateTokenAndLoadUser = async () => {
      try {
        // Try both endpoints to ensure backward compatibility
        let response = null;
        let error = null;
        
        try {
          response = await api.get('/api/auth/validate');
        } catch (e) {
          console.log('First validation endpoint failed, trying fallback...');
          error = e;
        }
        
        // If the first attempt failed, try the other endpoint
        if (!response) {
          try {
            response = await api.get('/api/validate');
          } catch (e) {
            console.log('Fallback validation endpoint also failed');
            // If both failed, throw the original error
            throw error || e;
          }
        }
        
        // Check if we have a valid response with user data
        if (!response.data || !response.data.user) {
          throw new Error('Invalid response format: missing user data');
        }
        
        // Update user with full details from server
        setCurrentUser(response.data.user);
        
        // Extract permissions and roles
        if (response.data.user.permissions) {
          setPermissions(response.data.user.permissions);
          console.log('Loaded permissions:', response.data.user.permissions);
        } else {
          console.warn('No permissions found in user data');
        }
        
        if (response.data.user.roles) {
          setUserRoles(response.data.user.roles);
          console.log('Loaded roles:', response.data.user.roles.map(r => r.name));
        } else {
          console.warn('No roles found in user data');
        }
        
        console.log('Token validated successfully, user data loaded');
      } catch (err) {
        console.error('Token validation failed:', err);
        // Token is invalid, remove it
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setPermissions([]);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    };
    
    validateTokenAndLoadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      // Get token from login endpoint
      const loginResponse = await api.post('/api/login', { email, password });
      const { token } = loginResponse.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data including permissions with the token
      const userResponse = await api.get('/api/auth/validate');
      setCurrentUser(userResponse.data.user);
      
      // Set permissions and roles
      if (userResponse.data.user.permissions) {
        setPermissions(userResponse.data.user.permissions);
      }
      
      if (userResponse.data.user.roles) {
        setUserRoles(userResponse.data.user.roles);
      }
      
      return loginResponse.data;
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
    setPermissions([]);
    setUserRoles([]);
  };
  
  // Check if user has specific permission
  const hasPermission = (resource, action) => {
    if (!currentUser) return false;
    
    // Check for direct permission match
    if (permissions.includes(`${resource}:${action}`)) {
      return true;
    }
    
    // Check for manage permission on resource
    if (permissions.includes(`${resource}:manage`)) {
      return true;
    }
    
    // Check for admin permission
    if (permissions.includes('*:*')) {
      return true;
    }
    
    return false;
  };
  
  // Check if user has a specific role
  const hasRole = (roleName) => {
    if (!currentUser || !userRoles || userRoles.length === 0) return false;
    
    return userRoles.some(role => 
      role.name.toLowerCase() === roleName.toLowerCase()
    );
  };

  const value = {
    currentUser,
    loading,
    error,
    permissions,
    userRoles,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
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
