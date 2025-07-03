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
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError(err.message);
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
        const res = await api.post('/products', payload);
        setProducts(prev => [...prev, res.data]);
    } 
    catch (err) {
      console.error(err);
    }
  }, []);

  const updateProduct = useCallback(async (upd) => {
    try {
      const priceNumber = typeof upd.price === 'string'
        ? parseFloat(upd.price.replace(/[$,]/g, ''))
        : upd.price;
      const payload = { ...upd, price: priceNumber };
      const res = await api.put(`/products/${payload.id}`, payload);
      setProducts(prev =>
        prev.map(p => (p.id === res.data.id ? res.data : p))
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
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
