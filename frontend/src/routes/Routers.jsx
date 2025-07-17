import { Route, Routes, Navigate } from 'react-router-dom';
import ProductPage from '../pages/ProductPage';
import HomePage from '../pages/Homepage';
import AddProductPage from '../pages/AddProductPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RoleManagementPage from '../pages/RoleManagementPage';
import UserManagementPage from '../pages/UserManagementPage';
import { useAuth } from '../context/AuthContext';

// Protected route that checks if user is authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Permission protected route that checks if user has specific permission
const PermissionRoute = ({ children, resource, action }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!hasPermission(resource, action)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <ProductPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/addproduct/:id?" 
        element={
          <ProtectedRoute>
            <AddProductPage />
          </ProtectedRoute>
        } 
      />
      
      {/* RBAC Routes */}
      <Route 
        path="/admin/roles" 
        element={
          <PermissionRoute resource="role" action="view">
            <RoleManagementPage />
          </PermissionRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <PermissionRoute resource="user" action="view">
            <UserManagementPage />
          </PermissionRoute>
        } 
      />
    </Routes>
  );
};
