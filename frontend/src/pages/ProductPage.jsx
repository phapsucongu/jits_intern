
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProduct';
import ProductList from '../components/ProductList';

export default function ProductPage() {
  const {
    products,
    loading,
    error,
    deleteProduct,
  } = useProducts();

  if (loading) return <div>Đang tải</div>;
  if (error)   return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Danh sách sản phẩm</h1>
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
        onEdit={() => {}}
      />
    </div>
  );
}
