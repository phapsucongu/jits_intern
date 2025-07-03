import { Route, Routes } from 'react-router-dom';
import ProductPage from '../pages/ProductPage';
import HomePage from '../pages/HomePage';
import AddProductPage from '../pages/AddProductPage';
export const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/addproduct/:id?" element={<AddProductPage />} />
    </Routes>
  );
};
