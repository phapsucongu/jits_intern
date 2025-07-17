import { useParams, useNavigate } from 'react-router-dom';
import { useDynamicData } from '../hooks/useDynamicModel';
import DynamicDataList from '../components/DynamicDataList';
import { Permission } from '../components/RBAC';
import { Link } from 'react-router-dom';

export default function DynamicDataPage() {
  const { modelName } = useParams();
  const navigate = useNavigate();
  
  // Capitalize model name for display
  const displayModelName = modelName ? 
    modelName.charAt(0).toUpperCase() + modelName.slice(1) : 
    '';
  
  const {
    data,
    loading,
    error,
    modelInfo,
    pagination,
    deleteRecord,
    changePage
  } = useDynamicData(displayModelName);
  
  const handleEdit = (id) => {
    navigate(`/edit/${modelName}/${id}`);
  };
  
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
        <h1 className="text-2xl font-semibold dark:text-white">
          {modelInfo?.displayName || displayModelName} List
        </h1>
        <div className="flex space-x-3">
          <Link
            to="/admin/models"
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            All Models
          </Link>
          <Permission resource={modelName} action="create">
            <Link
              to={`/add/${modelName}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add {modelInfo?.displayName || displayModelName}
            </Link>
          </Permission>
        </div>
      </div>
      
      <DynamicDataList
        data={data}
        modelInfo={modelInfo}
        loading={loading}
        pagination={pagination}
        onDelete={deleteRecord}
        onEdit={handleEdit}
        onPageChange={changePage}
      />
    </div>
  );
}
