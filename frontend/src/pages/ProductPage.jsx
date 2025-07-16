
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProduct';
import ProductList from '../components/ProductList';

export default function ProductPage() {
  const navigate = useNavigate();
  const {
    products,
    loading,
    error,
    deleteProduct,
    pagination,
    searchProducts,
    changePage,
  } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-full dark:bg-gray-800 dark:text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 dark:bg-gray-800 min-h-full">
      <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div id="product-page" className="p-6 space-y-6 min-h-full bg-white dark:bg-gray-800 dark:text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold dark:text-white">Danh sách sản phẩm</h1>
        <Link
          to="/addproduct"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ADD
        </Link>
      </div>

      <ProductList
        products={products}
        loading={loading}
        pagination={pagination}
        onDelete={deleteProduct}
        onEdit={(id) => navigate(`/addproduct/${id}`)}
        onSearch={(term) => {
          setSearchTerm(term);
          searchProducts(term);
        }}
        onPageChange={(page) => changePage(page)}
      />
    </div>
  );
}
