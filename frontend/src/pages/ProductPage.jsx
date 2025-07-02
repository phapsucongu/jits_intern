import React, { useState } from 'react';
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

  const handleAdd = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  return (
    <>
      <ProductForm onAdd={handleAdd} />
      <ProductList products={products} />
    </>
  );
};
