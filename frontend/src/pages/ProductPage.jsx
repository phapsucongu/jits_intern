// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';            // or import axios from 'axios';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAdd = async (newProd) => {
    try {
      const res = await api.post('/products', newProd);
      setProducts(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingProduct?.id === id) setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
  };

  const handleUpdate = async (updatedProd) => {
    try {
      const res = await api.put(`/products/${updatedProd.id}`, updatedProd);
      setProducts(prev =>
        prev.map(p => (p.id === res.data.id ? res.data : p))
      );
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 6) Hủy edit
  const handleCancel = () => {
    setEditingProduct(null);
  };

  if (loading) return <div>Đang tải sản phẩm…</div>;

  return (
    <div className="p-6 space-y-6">
      <ProductForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingProduct={editingProduct}
        onCancel={handleCancel}
      />
      <ProductList
        products={products}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
