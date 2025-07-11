import { useState, useEffect, useCallback } from 'react';
import api from '../instance/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/auth/products');
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (newProd) => {
    try {
      const priceNumber = typeof newProd.price === 'string'
        ? parseFloat(newProd.price.replace(/[$,]/g, ''))
        : newProd.price;
        const { id, ...rest } = newProd;
        const payload = { ...rest, price: priceNumber };
        console.log('Adding product:', payload);
        const res = await api.post('/api/auth/products', payload);
        setProducts(prev => [...prev, res.data]);
        return res.data;
    } 
    catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (upd) => {
    try {
      const priceNumber = typeof upd.price === 'string'
        ? parseFloat(upd.price.replace(/[$,]/g, ''))
        : upd.price;
      const payload = { ...upd, price: priceNumber };
      const res = await api.put(`/api/auth/products/${payload.id}`, payload);
      setProducts(prev =>
        prev.map(p => (p.id === res.data.id ? res.data : p))
      );
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.delete(`/api/auth/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
