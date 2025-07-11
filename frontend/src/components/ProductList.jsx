import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function ProductList({ products, onDelete, onEdit }) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(null);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">No products available.</div>
                <button 
                    onClick={() => navigate('/addproduct')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Your First Product
                </button>
            </div>
        );
    }

    const handleSearch = useCallback((query) => {
        setQuery(query);
        setCurrentPage(1);
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setIsDeleting(id);
            try {
                await onDelete(id);
            } catch (error) {
                console.error('Error deleting product:', error);
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const items = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q === '') return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(q)
        );
    }, [products, query]);

    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return (
        <div className="space-y-4">
            <SearchBar onSearch={handleSearch} />
            
            {items.length === 0 && query && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No products found matching "{query}".
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((product) => (
                    <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg shadow hover:shadow-md transition dark:border-gray-700 dark:bg-gray-800"
                    >
                        <div className="w-full aspect-[3/2] bg-gray-100 dark:bg-gray-700">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-medium dark:text-white">{product.name}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Price: ${parseFloat(product.price).toFixed(2)}
                            </p>
                            <div className="mt-4 flex space-x-2">
                                <button
                                    onClick={() => navigate(`/addproduct/${product.id}`)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={isDeleting === product.id}
                                    className={`px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 ${
                                        isDeleting === product.id ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isDeleting === product.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {items.length > pageSize && (
                <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${
                                currentPage === 1
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                        >
                            &laquo; Prev
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === index + 1
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${
                                currentPage === totalPages
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                        >
                            Next &raquo;
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
