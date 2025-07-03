import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProduct';
import ProductForm from '../components/ProductForm';

export default function AddProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useProducts();

  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (id) {
      const prod = products.find(p => p.id.toString() === id);
      if (prod) setEditingProduct(prod);
    }
  }, [id, products]);

  const handleSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct({ id: editingProduct.id, ...formData });
    } else {
      await addProduct(formData);
    }
    navigate('/products');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
      </h1>
      <ProductForm
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        onCancel={() => navigate('/products')}
      />
    </div>
  );
}