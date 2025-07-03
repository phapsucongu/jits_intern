import React, { useEffect, useState } from 'react';
export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (typeof onSearch === 'function') {
      onSearch(query.trim());
    }
  }, [query, onSearch]);
        

    return (
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="p-2 border border-gray-300 rounded"
        />
    );
}