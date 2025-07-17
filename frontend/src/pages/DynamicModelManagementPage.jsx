import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDynamicModels } from '../hooks/useDynamicModel';
import { Role } from '../components/RBAC';

export default function DynamicModelManagementPage() {
  const { models, loading, error, deleteModel } = useDynamicModels();
  const [isDeleting, setIsDeleting] = useState(null);
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model? All associated data will be lost.')) {
      setIsDeleting(id);
      try {
        await deleteModel(id);
      } catch (err) {
        console.error('Error deleting model:', err);
        alert(`Error: ${err.message}`);
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-full dark:bg-gray-800 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 dark:bg-gray-800 min-h-full">
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 min-h-full bg-white dark:bg-gray-800 dark:text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold dark:text-white">Dynamic Models</h1>
        <Role role="Admin">
          <Link
            to="/admin/models/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Model
          </Link>
        </Role>
      </div>
      
      {models.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No models available. Create your first model to get started.
          </div>
          <Role role="Admin">
            <Link
              to="/admin/models/create"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Model
            </Link>
          </Role>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Display Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Fields
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {model.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {model.fields.length} fields
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`/${model.name.toLowerCase()}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Data
                      </Link>
                      <Role role="Admin">
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          disabled={isDeleting === model.id}
                        >
                          {isDeleting === model.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </Role>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
