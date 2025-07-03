import { useState, useEffect } from 'react';

export default function ProductForm({ onSubmit, editingProduct, onCancel }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(String(editingProduct.price));
    } else {
      setName('');
      setPrice('');
    }
  }, [editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || price === '') return;

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber)) return;

    const formData = {
      name: name.trim(),
      price: priceNumber,
      image: editingProduct
        ? editingProduct.image
        : 'https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-led-tv-television-screen-vector-png-image_6673700.png',
    };

    if (typeof onSubmit === 'function') {
      if (editingProduct) {
        onSubmit({ id: editingProduct.id, ...formData });
      } else {
        onSubmit(formData);
      }
    }

    setName('');
    setPrice('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border border-gray-200 rounded-lg max-w-md"
    >
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter product name"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Price</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter price (e.g. 19.99)"
        />
      </div>
      <div className="flex space-x-2">
        {editingProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
        >
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
