
export default function ProductList({ products }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Product List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="w-full aspect-[3/2] bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-medium">{product.name}</h3>
              <p className="mt-2 text-gray-600">Price: {product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
