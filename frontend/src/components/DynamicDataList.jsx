import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Permission } from './RBAC';
import SearchBar from './SearchBar';

export default function DynamicDataList({
  data,
  modelInfo,
  onDelete,
  onEdit,
  pagination,
  onPageChange,
  loading
}) {
  const [isDeleting, setIsDeleting] = useState(null);
  
  const noData = !data || data.length === 0;
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsDeleting(id);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting record:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  // Get pagination data from props or use defaults
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  
  // If no model info is available, show a loading state
  if (!modelInfo && !loading) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        Error: Model information is not available.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <SearchBar />
      
      {noData && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">No {modelInfo?.displayName || 'items'} available.</div>
          <Permission resource={modelInfo?.name.toLowerCase()} action="create">
            <Link
              to={`/add/${modelInfo?.name.toLowerCase()}`}
              className="mt-4 px-4 py-2 inline-block bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add New {modelInfo?.displayName || 'Item'}
            </Link>
          </Permission>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
      
      {!noData && !loading && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {modelInfo?.fields.map((field, index) => (
                    <th 
                      key={index} 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      {field.name}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    {modelInfo?.fields.map((field, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {renderFieldValue(item.data[field.name], field.type)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Permission resource={modelInfo?.name.toLowerCase()} action="edit">
                          <button
                            onClick={() => onEdit(item.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                          </button>
                        </Permission>
                        <Permission resource={modelInfo?.name.toLowerCase()} action="delete">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            disabled={isDeleting === item.id}
                          >
                            {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </Permission>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages} ({pagination.total} items)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function renderFieldValue(value, type) {
  if (value === undefined || value === null) {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }
  
  switch (type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return new Date(value).toLocaleDateString();
    default:
      return String(value);
  }
}
