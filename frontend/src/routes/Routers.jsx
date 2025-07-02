import { Route, Routes } from 'react-router-dom';
import {ProductPage} from '../pages/ProductPage';
import {HomePage} from '../pages/HomePage';
export const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product" element={<ProductPage />} />
    </Routes>
  );
};
