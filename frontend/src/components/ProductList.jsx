import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { Permission } from './RBAC';

export default function ProductList({ 
    products, 
    onDelete, 
    onEdit, 
    onSearch, 
    onPageChange, 
    pagination,
    loading
}) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(null);

    const noProducts = !products || products.length === 0;

    const handleSearch = (query) => {
        if (typeof onSearch === 'function') {
            onSearch(query);
        }
    };
    
    // Separate method to handle searching when the search button is clicked
    const handleSearchSubmit = (query) => {
        handleSearch(query);
    };

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
    
    // Get pagination data from props or use defaults
    const currentPage = pagination?.page || 1;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="space-y-4">
            <SearchBar onSearch={handleSearchSubmit} />
            
            {noProducts && !loading && (
                <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">No products available.</div>
                    <button 
                        onClick={() => navigate('/addproduct')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Your Product
                    </button>
                </div>
            )}
            
            {!noProducts && products.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No products found. Try a different search term or add new products.
                </div>
            )}
            
            {loading && (
                <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
            )}
            
            {!noProducts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
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
                                <Permission resource="product" action="edit" fallback={null}>
                                    <button
                                        onClick={() => navigate(`/addproduct/${product.id}`)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                </Permission>
                                
                                <Permission resource="product" action="delete" fallback={null}>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={isDeleting === product.id}
                                        className={`px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 ${
                                            isDeleting === product.id ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isDeleting === product.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </Permission>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
            
            {!noProducts && totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => onPageChange && onPageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className={`px-3 py-1 rounded ${
                                currentPage === 1 || loading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                        >
                            &laquo; Prev
                        </button>
                        
                        {/* Show a limited number of page buttons */}
                        {Array.from(
                            { length: Math.min(5, totalPages) }, 
                            (_, i) => {
                                // Calculate which page numbers to show
                                let pageNum;
                                if (totalPages <= 5) {
                                    // If 5 or fewer pages, show all
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    // Near the start
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    // Near the end
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    // In the middle
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange && onPageChange(pageNum)}
                                        disabled={loading}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                        )}
                        
                        <button
                            onClick={() => onPageChange && onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className={`px-3 py-1 rounded ${
                                currentPage === totalPages || loading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                        >
                            Next &raquo;
                        </button>
                    </nav>
                </div>
            )}
            
            {/* Show pagination info */}
            {pagination && pagination.total > 0 && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Showing page {currentPage} of {totalPages} ({pagination.total} total items)
                </div>
            )}
        </div>
    );
}
