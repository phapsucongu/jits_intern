import { useState, useEffect } from 'react';

export default function ProductForm({ onSubmit, editingProduct, onCancel }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(String(editingProduct.price));
    } else {
      setName('');
      setPrice('');
    }
  }, [editingProduct]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const priceNumber = parseFloat(price);

    const formData = {
      name: name.trim(),
      price: priceNumber,
      image: editingProduct
        ? editingProduct.image
        : 'https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-led-tv-television-screen-vector-png-image_6673700.png',
    };

    try {
      if (typeof onSubmit === 'function') {
        if (editingProduct) {
          await onSubmit({ id: editingProduct.id, ...formData });
        } else {
          await onSubmit(formData);
        }
      }

      if (!editingProduct) {
        setName('');
        setPrice('');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ form: error.message || 'An error occurred while saving the product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border border-gray-200 rounded-lg max-w-md dark:border-gray-700 dark:bg-gray-800"
    >
      {errors.form && (
        <div className="p-3 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
          {errors.form}
        </div>
      )}

      <div>
        <label className="block mb-1 font-medium dark:text-gray-200">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter product name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium dark:text-gray-200">Price</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.price ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter price (e.g. 19.99)"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.price}</p>
        )}
      </div>

      <div className="flex space-x-2">
        {editingProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting
            ? editingProduct
              ? 'Updating...'
              : 'Adding...'
            : editingProduct
            ? 'Update Product'
            : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
