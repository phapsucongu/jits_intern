
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
  } = useProducts();

  if (loading) return <div className="p-6 flex justify-center items-center min-h-full dark:bg-gray-800 dark:text-white">Đang tải...</div>;
  if (error)   return <div className="p-6 text-red-500 dark:text-red-400 dark:bg-gray-800 min-h-full">Lỗi: {error}</div>;

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
        onDelete={deleteProduct}
        onEdit={(id) => navigate(`/addproduct/${id}`)}
      />
    </div>
  );
}
