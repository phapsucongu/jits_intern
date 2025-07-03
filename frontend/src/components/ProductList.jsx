import { useState, useMemo,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
export default function ProductList({ products, onEdit, onDelete }) {
    const navigate = useNavigate();
        if (!products || products.length === 0) {
            return <div className="text-gray-500">No products available.</div>;
        }
    
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const handleSearch = useCallback((query) => {
        setQuery(query);
        setCurrentPage(1);
    }, []);

    const items = useMemo(() => {
            const q = query.trim().toLowerCase();
        if (q === '') return products;
        return products.filter(p =>
              p.name.toLowerCase().includes(q)
        );
    }, [products,query]);

    const toltalPages = Math.ceil(items.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return (
        <div className="space-y-4">
        <SearchBar onSearch={handleSearch} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((product) => (
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
                <div className="mt-4 flex space-x-2">
                    <button
                    onClick={() => navigate(`/addproduct/${product.id}`)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                    Edit
                    </button>
                    <button
                    onClick={() => onDelete(product.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                    Delete
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
            {items.length > pageSize && (
            <div className="flex justify-center mt-4">
                <nav className="flex space-x-2">
                {Array.from({ length: toltalPages }, (_, index) => (
                    <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded ${
                        currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    >
                    {index + 1}
                    </button>
                ))}
                </nav>
            </div>)}
        </div>
    );
}
