import { useState } from 'react';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

export const ProductPage = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Product A',
      price: '$19.99',
      image: 'https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-led-tv-television-screen-vector-png-image_6673700.png',
    },
    {
      id: 2,
      name: 'Product B',
      price: '$29.99',
      image: 'https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-led-tv-television-screen-vector-png-image_6673700.png',
    },
    {
      id: 3,
      name: 'Product C',
      price: '$39.99',
      image: 'https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-led-tv-television-screen-vector-png-image_6673700.png',
    },
  ]);

  const [editingProduct, setEditingProduct] = useState(null);

  const handleAdd = (newProd) => {
    setProducts((prev) => [...prev, newProd]);
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
  };

  const handleUpdate = (updatedProd) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div>
      <ProductForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingProduct={editingProduct}
        onCancel={handleCancelEdit}
      />
      <ProductList
        products={products}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
