import { useState, useEffect, useCallback } from 'react';
import api from '../instance/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [keyword, setKeyword] = useState('');

  const fetchPaginatedProducts = useCallback(async (page = 1, limit = 10, searchKeyword = '') => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page,
        limit: limit
      });
      
      // Add keyword if provided
      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }
      
      const res = await api.get(`/api/auth/paginate/products?${params.toString()}`);
      
      setProducts(res.data.results);
      setPagination(res.data.pagination);
      setKeyword(searchKeyword);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Legacy method for backward compatibility
  const fetchProducts = useCallback(async () => {
    await fetchPaginatedProducts(1, 10);
  }, [fetchPaginatedProducts]);

  const addProduct = useCallback(async (newProd) => {
    try {
      const priceNumber = typeof newProd.price === 'string'
        ? parseFloat(newProd.price.replace(/[$,]/g, ''))
        : newProd.price;
      
      // Remove any id property if it exists in a new product
      const { id, ...rest } = newProd;
      const payload = { ...rest, price: priceNumber };
      
      const res = await api.post('/api/auth/products', payload);
      setProducts(prev => [...prev, res.data]);
      console.log('Product added successfully:', res.data);
      return res.data;
    } 
    catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to add product');
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

  // Only fetch on initial load, not on every rerender
  useEffect(() => {
    // Initial data load
    fetchPaginatedProducts(1, 10);
    // We only want this to run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Method to handle search and pagination together
  const searchProducts = useCallback((searchTerm) => {
    setKeyword(searchTerm);
    // Use the current pagination limit from state rather than the dependency
    fetchPaginatedProducts(1, pagination.limit, searchTerm);
  }, [fetchPaginatedProducts, pagination.limit]);
  
  // Method to change page
  const changePage = useCallback((newPage) => {
    fetchPaginatedProducts(newPage, pagination.limit, keyword);
  }, [fetchPaginatedProducts, pagination.limit, keyword]);
  
  // Method to change items per page
  const changeLimit = useCallback((newLimit) => {
    fetchPaginatedProducts(1, newLimit, keyword);
  }, [fetchPaginatedProducts, keyword]);

  return {
    products,
    loading,
    error,
    pagination,
    keyword,
    fetchProducts,
    fetchPaginatedProducts,
    searchProducts,
    changePage,
    changeLimit,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
