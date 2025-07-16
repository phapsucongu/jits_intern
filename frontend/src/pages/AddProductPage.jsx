import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProduct';
import ProductForm from '../components/ProductForm';

export default function AddProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, loading } = useProducts();

  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState(null);

  // Only load product if editing
  useEffect(() => {
    if (id) {
      const prod = products.find(p => p.id.toString() === id);
      if (prod) {
        setEditingProduct(prod);
      } else {
        setFormError(`Không tìm thấy sản phẩm với ID ${id}`);
      }
    }
  }, [id, products]);

  // Simple direct submit handler with immediate navigation
  const handleSubmit = async (formData) => {
    setFormError(null);
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...formData });
      } else {
        await addProduct(formData);
      }
      
      navigate('/products');
    } catch (err) {
      setFormError(err.message || 'Đã xảy ra lỗi trong quá trình lưu sản phẩm');
    }
  };

  // Simple loading indicator
  if (loading && id) return (
    <div className="flex justify-center items-center h-64 dark:bg-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
    </div>
  );

  // Error display when product not found
  if (formError && !editingProduct && id) {
    return (
      <div className="p-6 max-w-md mx-auto dark:bg-gray-800">
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
          <p>{formError}</p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  // Main form render
  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded shadow-md">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">
        {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
      </h1>
      
      {formError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600">
          <p>{formError}</p>
        </div>
      )}
      
      <ProductForm
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        onCancel={() => navigate('/products')}
      />
    </div>
  );
}