import { useState, useEffect, useCallback } from 'react';
import api from '../instance/api';

export function useDynamicModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all dynamic models
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/auth/dynamic-models');
      setModels(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new dynamic model
  const createModel = useCallback(async (modelData) => {
    try {
      const res = await api.post('/api/auth/dynamic-models', modelData);
      setModels(prev => [...prev, res.data.model]);
      return res.data.model;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create model');
    }
  }, []);

  // Update an existing model
  const updateModel = useCallback(async (id, modelData) => {
    try {
      const res = await api.put(`/api/auth/dynamic-models/${id}`, modelData);
      setModels(prev => prev.map(model => (model.id === id ? res.data.model : model)));
      return res.data.model;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update model');
    }
  }, []);

  // Delete a model
  const deleteModel = useCallback(async (id) => {
    try {
      await api.delete(`/api/auth/dynamic-models/${id}`);
      setModels(prev => prev.filter(model => model.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete model');
    }
  }, []);

  // Load models when component mounts
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    fetchModels,
    createModel,
    updateModel,
    deleteModel
  };
}

export function useDynamicData(modelName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch data with pagination
  const fetchData = useCallback(async (page = 1, limit = 10) => {
    if (!modelName) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit
      });
      
      const res = await api.get(`/api/auth/dynamic-data/${modelName}?${params}`);
      setData(res.data.results);
      setPagination(res.data.pagination);
      setModelInfo(res.data.model);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [modelName]);

  // Create a new record
  const createRecord = useCallback(async (recordData) => {
    try {
      const res = await api.post(`/api/auth/dynamic-data/${modelName}`, { data: recordData });
      setData(prev => [...prev, res.data.record]);
      return res.data.record;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create record');
    }
  }, [modelName]);

  // Update an existing record
  const updateRecord = useCallback(async (id, recordData) => {
    try {
      const res = await api.put(`/api/auth/dynamic-data/${modelName}/${id}`, { data: recordData });
      setData(prev => prev.map(record => (record.id === id ? res.data.record : record)));
      return res.data.record;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update record');
    }
  }, [modelName]);

  // Delete a record
  const deleteRecord = useCallback(async (id) => {
    try {
      await api.delete(`/api/auth/dynamic-data/${modelName}/${id}`);
      setData(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete record');
    }
  }, [modelName]);

  // Change page
  const changePage = useCallback((page) => {
    fetchData(page, pagination.limit);
  }, [fetchData, pagination.limit]);

  // Load data when component mounts
  useEffect(() => {
    if (modelName) {
      fetchData(1, 10);
    }
  }, [fetchData, modelName]);

  return {
    data,
    loading,
    error,
    modelInfo,
    pagination,
    fetchData,
    createRecord,
    updateRecord,
    deleteRecord,
    changePage
  };
}
