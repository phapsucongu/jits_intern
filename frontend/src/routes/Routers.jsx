import { Route, Routes, Navigate } from 'react-router-dom';
import ProductPage from '../pages/ProductPage';
import HomePage from '../pages/HomePage';
import AddProductPage from '../pages/AddProductPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { useAuth } from '../context/AuthContext';

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
    </Routes>
  );
};
