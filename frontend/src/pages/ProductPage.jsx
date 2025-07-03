
import { useState } from 'react'
import { useProducts } from '../hooks/useProduct'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'

export default function ProductPage() {
  const {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProducts()

  const [editingProduct, setEditingProduct] = useState(null)

  if (loading) return <div>Đang tải sản phẩm…</div>
  if (error)   return <div className="text-red-500">Lỗi: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <ProductForm
        onAdd={addProduct}
        onUpdate={updateProduct}
        editingProduct={editingProduct}
        onCancel={() => setEditingProduct(null)}
      />
      <ProductList
        products={products}
        onDelete={id => {
          deleteProduct(id)
          if (editingProduct?.id === id) {
            setEditingProduct(null)
          }
        }}
        onEdit={setEditingProduct}
      />
    </div>
  )
}
